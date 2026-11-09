"use strict";

import powerbi from "powerbi-visuals-api";
import IVisual = powerbi.extensibility.visual.IVisual;
import IVisualHost = powerbi.extensibility.visual.IVisualHost;
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import VisualObjectInstance = powerbi.VisualObjectInstance;
import VisualObjectInstanceEnumeration = powerbi.VisualObjectInstanceEnumeration;
import EnumerateVisualObjectInstancesOptions = powerbi.EnumerateVisualObjectInstancesOptions;
import IVisualEventService = powerbi.extensibility.IVisualEventService;
import ILocalizationManager = powerbi.extensibility.ILocalizationManager;
import IColorPalette = powerbi.extensibility.IColorPalette;
import DataView = powerbi.DataView;
import { IFilterColumnTarget, AdvancedFilter } from "powerbi-models";
import { FormattingSettingsService } from "powerbi-visuals-utils-formattingmodel";
import { VisualSettingsModel } from "./vsettings";
import { ColorHelper } from "powerbi-visuals-utils-colorutils";
import { VisualState, dateRange, dateCardProps } from "./interface";
import { mapOptionsToState, restoreRangeFilter } from "./optionsMapper";
import tinycolor from "tinycolor2";
import DateRangeCard from "./components/daterangecard";
import { isEqual } from "lodash";
import { LocalizationContext, DateFnsLocaleProvider } from "./localeutils";
import { ReactVisual } from "./reactUtils";
import { HotkeysProvider } from "react-hotkeys-hook";
import { toDateRange } from "./dateutils";
import "../assets/visual.less";
/**
 * The DateSelector class is the main entry point for the visual. It manages the
 * lifecycle of the visual and handles communication between Power BI and the React component.
 * It now inherits from ReactVisual to abstract away the React rendering logic.
 */
export class DateSelector extends ReactVisual implements IVisual {
  private visualHost!: IVisualHost;
  private events!: IVisualEventService;
  // private selectionManager: powerbi.extensibility.ISelectionManager;
  private localizationManager!: ILocalizationManager;
  private formattingSettings!: VisualSettingsModel;
  private formattingSettingsService!: FormattingSettingsService;
  private lastFormattingSettings: VisualSettingsModel | null = null;
  private dataView: DataView | null = null;
  private colorPalette!: IColorPalette;
  private colorHelper!: ColorHelper;
  private state: VisualState = { settings: {} as dateCardProps };
  private locale = "en-US";
  // We now use a single state variable to track the applied filter, simplifying the logic.
  private currentFilter: dateRange | null = null;
  // private persistedFilter: dateRange | null = null;
  // private bookmarkFilter: dateRange | null = null;
  private isApplyingFilter = false;
  private pendingFilter: dateRange | null = null;
  // A flag to prevent a redundant UI update when the visual applies its own filter.
  private isUpdatingFromVisual: boolean = false;
  // A flag to ensure we only apply the initial state once.
  private initialLoadComplete: boolean = false;

  private static readonly BOOKMARK_OBJECT = "general";
  private static readonly BOOKMARK_PROPERTY = "filter";
  private static readonly filterObjectProperty = {
    objectName: "general",
    propertyName: "filter",
  };
  private lastKnownFilterSignature: string | null = null;
  private bookmarkDetectionWindow = 1000; // 1 second grace period after load
  private lastUpdateTime = 0;
  private maybeBookmarkActive = false;

  // simplified signature generator
  private getFilterSignature(options: VisualUpdateOptions): string {
    const filters =
      options.jsonFilters?.map((f) => JSON.stringify(f)).join("|") ?? "";
    return filters;
  }

  /**
   * The constructor initializes visual properties and the React root.
   * @param options The visual constructor options from Power BI.
   */
  constructor(
    options: VisualConstructorOptions = {} as VisualConstructorOptions,
  ) {
    // Call the parent constructor from ReactVisual to initialize the React component and root
    super(options);
    this.initializeVisualProperties(options);
    this.initializeReact();
    // this.selectionManager= options.host.createSelectionManager();
    this.localizationManager = options.host.createLocalizationManager();
    this.formattingSettingsService = new FormattingSettingsService(
      this.localizationManager,
    );
  }

  /**
   * Initializes visual-specific properties and services.
   * @param options The visual constructor options.
   */
  protected initializeVisualProperties(
    options: VisualConstructorOptions,
  ): void {
    this.visualHost = options.host;
    this.locale = options.host.locale;
    // this.selectionManager = options.host.createSelectionManager();
    this.events = options.host.eventService;
    this.colorPalette = this.visualHost.colorPalette;
    this.colorHelper = new ColorHelper(this.colorPalette);
  }

  /**
   * Initializes the React component by passing the main component and the data handler to the base class.
   */
  protected initializeReact(): void {
    const VisualComponent = (props: any) => (
      <LocalizationContext.Provider value={this.localizationManager}>
        <DateFnsLocaleProvider languageCode={this.locale}>
          <HotkeysProvider>
            <DateRangeCard {...props} />
          </HotkeysProvider>
        </DateFnsLocaleProvider>
      </LocalizationContext.Provider>
    );
    super.initializeReact(VisualComponent, (interval) =>
      this.applyDateFilter(interval),
    );
  }

  /**
   * The update method is called whenever the visual's data or settings change.
   * It handles the core logic of the visual.
   * @param options The visual update options from Power BI.
   */

  public update(options: VisualUpdateOptions) {
    try {
      this.events.renderingStarted(options);

      // Prevent infinite loops when the visual itself applies a filter
      if (this.isUpdatingFromVisual) {
        this.isUpdatingFromVisual = false;
        this.events.renderingFinished(options);
        return;
      }

      // 1. HARD GATE FOR INVALID/UNMAPPED DATA VIEWS
      if (!this.isValidDataView(options)) {
        this.initialiseVisualState();

        // 1. Instantiate the real model matching your class structure
        const freshSettings = new VisualSettingsModel();
        this.formattingSettings = freshSettings;

        // 2. Destructure and format properties from your actual cards
        // to maintain the exact layout contract your components expect.
        const defaultCardProps = {
          // Flatten property cards if your mapOptionsToState flattens them,
          // or pass them down cleanly as sub-objects matching your component design:
          style: freshSettings.style,
          calendar: freshSettings.calendar,
          layout: freshSettings.layout,
          period: freshSettings.period,

          // Fallback global configurations
          themeMode: "light",
        };

        // Assign the clean structured properties to your visual state wrapper
        this.state.settings = defaultCardProps as any;

        // 3. Update React Containers with the exact structure it demands
        this.updateReactContainers({
          ...defaultCardProps,
          landingOff: false,
          dates: { start: null, end: null },
        });

        this.events.renderingFinished(options);
        return;
      }

      // 2. DATA VIEW AND SETTINGS LOAD (Only execute if fields are verified)
      const shouldGetSettings = !isEqual(options.dataViews[0], this.dataView);
      this.dataView = options.dataViews[0];

      // Always try to load formatting settings; the service will update them from options
      this.loadVisualSettings(options);

      // 3. SET LANDING PAGE SWITCH
      this.state.landingOff = true;

      const now = Date.now();
      const filterSignature = this.getFilterSignature(options);
      const isFilterChange = filterSignature !== this.lastKnownFilterSignature;
      const elapsed = now - this.lastUpdateTime;
      this.lastUpdateTime = now;

      if (
        isFilterChange &&
        elapsed < this.bookmarkDetectionWindow &&
        this.initialLoadComplete
      ) {
        this.maybeBookmarkActive = true;
      } else {
        this.maybeBookmarkActive = false;
      }
      this.lastKnownFilterSignature = filterSignature;

      // Normalise host filter from options
      const hostFilter = restoreRangeFilter(options);

      let resolvedFilter: dateRange | null = null;
      let shouldApplyFilter = false;

      if (this.maybeBookmarkActive && hostFilter) {
        resolvedFilter = hostFilter;
      } else if (
        this.state.settings.forceStartRange &&
        !this.initialLoadComplete
      ) {
        resolvedFilter = this.state.settings.startupFilter ?? null;
        shouldApplyFilter = true;
      } else if (hostFilter) {
        resolvedFilter = hostFilter;
      } else if (this.state.settings.startupFilter) {
        resolvedFilter = this.state.settings.startupFilter;
        shouldApplyFilter = !this.initialLoadComplete;
      }

      if (shouldApplyFilter && resolvedFilter) {
        this.applyDateFilter(resolvedFilter);
        this.currentFilter = resolvedFilter;

        const propsToPass = {
          ...this.state.settings,
          dates: this.currentFilter,
          landingOff: true,
        };
        this.updateReactContainers(propsToPass);

        this.initialLoadComplete = true;
        this.events.renderingFinished(options);
        return;
      }

      // Update React UI
      this.currentFilter = resolvedFilter ?? this.currentFilter;
      const propsToPass2 = {
        ...this.state.settings,
        dates: this.currentFilter,
        landingOff: true,
      };
      this.updateReactContainers(propsToPass2);

      this.initialLoadComplete = true;
      this.events.renderingFinished(options);
    } catch (e) {
      console.error("Update failed:", e);
      this.events.renderingFailed(options);
    }
  }

  /**
   * Verified Data View structure check. Assures actual fields are bound to query buckets.
   */
  private isValidDataView(options: VisualUpdateOptions): boolean {
    return !!(
      options &&
      options.dataViews &&
      options.dataViews[0] &&
      options.dataViews[0].categorical &&
      options.dataViews[0].categorical.categories &&
      options.dataViews[0].categorical.categories[0] &&
      options.dataViews[0].categorical.categories[0].values &&
      options.dataViews[0].categorical.categories[0].values.length > 0
    );
  }
  /**
   * A helper method to initialize the visual state.
   */
  private initialiseVisualState(): void {
    this.dataView = null;
    this.currentFilter = null;
    this.initialLoadComplete = false;
  }

  /**
   * Loads the visual settings from the data view.
   * @param options The visual update options.
   */
  /**
   * Loads the visual settings from the data view with defensive error isolation.
   * @param options The visual update options.
   */
  private loadVisualSettings(options: VisualUpdateOptions): void {
    try {
      // Attempt to populate using the utils formatting service
      this.formattingSettings =
        this.formattingSettingsService.populateFormattingSettingsModel(
          VisualSettingsModel,
          options.dataViews?.[0],
        );
      // console.log("Loaded formatting settings:", this.formattingSettings);
    } catch (e) {
      console.warn(
        "FormattingSettingsService failed to parse dataView properties safely. Falling back to defaults.",
        e,
      );
      // Fallback completely to avoid crashing the entire visual update cycle
      this.formattingSettings = new VisualSettingsModel();
    }

    // Wrap the mapper call in case it expects properties that failed to populate
    try {
      const newVisualState = mapOptionsToState(
        options,
        this.formattingSettings,
        this.initialLoadComplete,
      );

      this.state = {
        ...this.state,
        ...newVisualState,
      };
    } catch (mapperError) {
      console.warn(
        "Failed to map visual options to state cleanly:",
        mapperError,
      );
    }

    if (this.colorHelper?.isHighContrast) {
      const foregroundColor =
        this.colorHelper.getHighContrastColor("foreground");
      const backgroundColor =
        this.colorHelper.getHighContrastColor("background");
      const themeMode = tinycolor(backgroundColor).isDark() ? "dark" : "light";

      if (this.state?.settings) {
        Object.assign(this.state.settings, {
          fontColor: foregroundColor,
          themeColor: foregroundColor,
          themeMode,
        });
      }
    }
  }

  /**
   * Returns the visual's properties for the formatting pane.
   * @param options The enumeration options.
   */
  public enumerateObjectInstances(
    options: EnumerateVisualObjectInstancesOptions,
  ): VisualObjectInstanceEnumeration {
    let objectEnumeration: VisualObjectInstance[] = [];

    if (options.objectName === DateSelector.BOOKMARK_OBJECT) {
      const bookmarkState = {
        filter: this.currentFilter || { start: null, end: null },
      };
      const instance: VisualObjectInstance = {
        objectName: DateSelector.BOOKMARK_OBJECT,
        displayName: "Bookmark Filter",
        selector: {} as any,
        properties: {
          [DateSelector.BOOKMARK_PROPERTY]: JSON.stringify(bookmarkState),
        },
      };

      objectEnumeration.push(instance);
    }
    return objectEnumeration;
  }

  /**
   * Applies a new filter to the date column.
   * This method is a public arrow function to ensure `this` context is preserved.
   * @param dates The date range to filter by.
   */
  public applyDateFilter = (dates: {
    start: Date | string | number;
    end: Date | string | number;
  }): void => {
    if (!this.state?.category) return;

    const dtes = toDateRange(dates);

    // Mark pending; do NOT push to React here — DateRangeCard already updated UI locally.
    this.isApplyingFilter = true;
    this.pendingFilter = {
      start: new Date(dtes.start),
      end: new Date(dtes.end),
    };

    this.visualHost.applyJsonFilter(
      this.createFilter(dtes.start, dtes.end, this.state.category.filterTarget),
      DateSelector.filterObjectProperty.objectName,
      DateSelector.filterObjectProperty.propertyName,
      dates.start && dates.end
        ? powerbi.FilterAction.merge
        : powerbi.FilterAction.remove,
    );
  };

  /**
   * Creates an advanced filter object for Power BI.
   * @param startDate The start date for the filter.
   * @param endDate The end date for the filter.
   * @param filterTarget The filter target object.
   * @returns An `AdvancedFilter` instance.
   */
  public createFilter(
    startDate: Date,
    endDate: Date,
    filterTarget: IFilterColumnTarget,
  ): AdvancedFilter {
    // The dates are already Date objects, so we can directly use toJSON().
    return new AdvancedFilter(
      filterTarget,
      "And",
      {
        operator: "GreaterThanOrEqual",
        value: startDate.toJSON(),
      },
      {
        operator: "LessThanOrEqual",
        value: endDate.toJSON(),
      },
    );
  }

  /**
   * Returns the formatting model for the properties pane.
   */
  public getFormattingModel(): powerbi.visuals.FormattingModel {
    if (!this.formattingSettings) {
      this.formattingSettings = new VisualSettingsModel();
    }
    return this.formattingSettingsService.buildFormattingModel(
      this.formattingSettings,
    );
  }
}

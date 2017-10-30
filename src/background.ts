import * as resemble from "resemblejs";
import * as URI from "urijs";

import CssBuilder from "./CssBuilder";
import DefaultState from "./DefaultState";
import Message from "./Message";
import SettingId from "./SettingId";

// PersistentStorage Class ------------------------------------------------ {{{

// tslint:disable:object-literal-sort-keys
class PersistentStorage {
  protected dataObject: any;
  private name: string;

  private lastSave: number;

  constructor(name: string) {
    this.setData(name);
    this.lastSave = Date.now();
  }

  private setData(savedObjectName: string) {
    this.name = savedObjectName;
    // Special syntax for using `this` inside a callback
    chrome.storage.local.get(savedObjectName, result => {
      this.dataObject = result[this.name];

      // Guard against undefined `dataObject`
      if (typeof this.dataObject === "undefined") {
        this.dataObject = {};
      }
    });
  }

  protected getAll(): any {
    return this.dataObject;
  }

  protected get(key: string): any {
    try {
      return this.dataObject[key];
    } catch (e) {
      if (debug) {
        // tslint:disable:no-console
        console.log(
          key +
            " does not exist in PersistentStorage object named: " +
            this.name,
        );
      }
    }
  }

  protected add(key: string, data: any) {
    this.dataObject[key] = data;
  }

  protected exists(key: string, object: any): boolean {
    if (object.hasOwnProperty(key)) {
      return true;
    }
    return false;
  }

  protected remove(key: string) {
    if (this.exists(key, this.dataObject)) {
      delete this.dataObject[key];
    }
  }

  protected save() {
    const saveIntervalMs = 100;
    if (Date.now() > this.lastSave + saveIntervalMs) {
      chrome.storage.local.remove(this.name);
      if (debug) {
        console.log("Saving: " + this.name);
      }
      const saveObject = {};
      saveObject[this.name] = this.dataObject;
      if (debug) {
        console.log(saveObject);
      }
      chrome.storage.local.set(saveObject);
      this.lastSave = Date.now();
    }
  }

  protected clear() {
    chrome.storage.local.remove(this.name);
    this.setData(this.name);
  }
}

// End PersistentStorage Class -------------------------------------------- }}}
// GlobalSettings Class ----------------------------------------------- {{{

// tslint:disable:max-classes-per-file
class GlobalSettings extends PersistentStorage {
  constructor() {
    super("globalSettings");
  }

  private getField(field: string): any {
    return this.dataObject[field];
  }

  private toggleField(field: string, defaultValue: boolean): void {
    if (typeof this.getField(field) !== "undefined") {
      this.dataObject[field] = !this.getField(field);
    } else {
      this.dataObject[field] = !defaultValue;
    }
    this.save();
  }

  setField(field: string, value: any): void {
    this.dataObject[field] = value;
    this.save();
  }

  private checkField(field: string, defaultValue: any): any {
    if (typeof this.getField(field) !== "undefined") {
      return this.getField(field);
    } else {
      return defaultValue;
    }
  }

  // Auto Dark
  public checkAutoDark(): boolean {
    return this.checkField(
      SettingId.Field.AutoDark,
      SettingId.Default.AutoDark,
    );
  }

  public toggleAutoDark(): void {
    return this.toggleField(
      SettingId.Field.AutoDark,
      SettingId.Default.AutoDark,
    );
  }

  // Dark
  public checkDark(): boolean {
    return this.checkField(SettingId.Field.Dark, SettingId.Default.Dark);
  }

  public toggleDark(): void {
    return this.toggleField(SettingId.Field.Dark, SettingId.Default.Dark);
  }

  // Hue
  public checkHue(): boolean {
    return this.checkField(SettingId.Field.Hue, SettingId.Default.Hue);
  }

  public toggleHue(): void {
    return this.toggleField(SettingId.Field.Hue, SettingId.Default.Hue);
  }

  // Notifications
  public checkShowNotifications(): boolean {
    return this.checkField(
      SettingId.Field.ShowNotifications,
      SettingId.Default.ShowNotifications,
    );
  }

  public toggleShowNotifications(): void {
    return this.toggleField(
      SettingId.Field.ShowNotifications,
      SettingId.Default.ShowNotifications,
    );
  }

  // Log AutoDark
  public checkLogAutoDark(): boolean {
    return this.checkField(
      SettingId.Field.LogAutoDark,
      SettingId.Default.LogAutoDark,
    );
  }

  public toggleLogAutoDark(): void {
    return this.toggleField(
      SettingId.Field.LogAutoDark,
      SettingId.Default.LogAutoDark,
    );
  }
}

// End GlobalSettings Class ------------------------------------------- }}}
// Url Settings Class ------------------------------------------------------ {{{

// I would like to put this inside the `UrlSettings` class but typescript does
// not allow this.
enum QueryResult {
  True,
  False,
  Undefined,
}

class UrlSettings extends PersistentStorage {
  private fields: any;
  private globalSettings: GlobalSettings;

  constructor(globalSettingObject) {
    super("urlInfo");
    this.globalSettings = globalSettingObject;
    // List the fields that exist and can be accessed
    this.fields = {
      darkMode: {
        name: "darkMode",
        type: "boolean",
      },
      hueRotate: {
        name: "hueRotate",
        type: "boolean",
      },
    };
  }

  private getSettings(): any {
    return this.dataObject;
  }

  private returnQueryResultIfBool(input: any): any {
    if (input === true) {
      return QueryResult.True;
    } else if (input === false) {
      return QueryResult.False;
    } else {
      return input;
    }
  }

  private checkUrlStem(url: Url): QueryResult {
    const urlStem = url.getStem();
    if (this.exists(urlStem, this.dataObject)) {
      return QueryResult.True;
    }
    return QueryResult.Undefined;
  }

  private checkUrlForField(url: Url, field: string): QueryResult {
    const urlStem = url.getStem();
    const cleanedUrl = url.getNormal();
    if (this.exists(urlStem, this.dataObject)) {
      if (this.exists(cleanedUrl, this.dataObject[urlStem])) {
        if (this.exists(field, this.dataObject[urlStem][cleanedUrl])) {
          return this.returnQueryResultIfBool(
            this.dataObject[urlStem][cleanedUrl][field],
          );
        }
      }
    }
    return QueryResult.Undefined;
  }

  private checkUrlStemForField(url: Url, field: string): QueryResult {
    const urlStem = url.getStem();
    if (this.exists(urlStem, this.dataObject)) {
      if (this.exists(field, this.dataObject[urlStem])) {
        return this.returnQueryResultIfBool(this.dataObject[urlStem][field]);
      }
    }
    return QueryResult.Undefined;
  }

  private checkUrlStemForUrl(url: Url): QueryResult {
    const urlStem = url.getStem();
    const cleanedUrl = url.getNormal();
    if (this.exists(urlStem, this.dataObject)) {
      if (this.exists(cleanedUrl, this.dataObject[urlStem])) {
        return QueryResult.True;
      }
    }
    return QueryResult.Undefined;
  }

  private checkUrlForFieldBool(
    url: Url,
    field: string,
    resultIfUndefined: boolean,
  ): boolean {
    // Various scenarios for checking bool fields.
    //  Url Query Result | Url Stem Query Result | Result            |
    //  ---              | ---                   | ---               |
    //  Undef            | Undef                 | resultIfUndefined |
    //  Undef            | True                  | True              |
    //  True             | True                  | True              |
    //  True             | Undef                 | True              |
    //  False            | True                  | False             |
    //  False            | Undef                 | False             |
    //  Undef            | False                 | False             |
    //  True             | False                 | False             |
    //  False            | False                 | False             |

    const urlResult = this.checkUrlForField(url, field);
    const urlStemResult = this.checkUrlStemForField(url, field);

    if (debug) {
      console.log(
        "Url is: " +
          QueryResult[urlResult] +
          ", Url Stem is: " +
          QueryResult[urlStemResult],
      );
    }

    // The default case: both fields are undefined, return the default value
    if (
      urlResult === QueryResult.Undefined &&
      urlStemResult === QueryResult.Undefined
    ) {
      return resultIfUndefined;
    }

    // True Results
    if (
      urlResult === QueryResult.Undefined &&
      urlStemResult === QueryResult.True
    ) {
      return true;
    }
    if (urlResult === QueryResult.True && urlStemResult === QueryResult.True) {
      return true;
    }
    if (
      urlResult === QueryResult.True &&
      urlStemResult === QueryResult.Undefined
    ) {
      return true;
    }
    if (urlResult === QueryResult.True && urlStemResult === QueryResult.False) {
      return true;
    }

    // False Results
    if (urlResult === QueryResult.False && urlStemResult === QueryResult.True) {
      return false;
    }
    if (
      urlResult === QueryResult.False &&
      urlStemResult === QueryResult.Undefined
    ) {
      return false;
    }
    if (
      urlResult === QueryResult.Undefined &&
      urlStemResult === QueryResult.False
    ) {
      return false;
    }
    if (
      urlResult === QueryResult.False &&
      urlStemResult === QueryResult.False
    ) {
      return false;
    }
    if (debug) {
      console.log("Error: checkWhitelist returned without a result");
    }
    return;
  }

  private checkUrlStemForFieldBool(
    url: Url,
    field: string,
    defaultValue: boolean,
  ): boolean {
    const result = this.checkUrlStemForField(url, field);

    switch (result) {
      case QueryResult.Undefined:
        return defaultValue;
      case QueryResult.True:
        return true;
      case QueryResult.False:
        return false;
    }
  }

  public checkDarkMode(url: Url): boolean {
    // If the stem and the url are undefined turn dark mode ON!
    return this.checkUrlForFieldBool(
      url,
      this.fields.darkMode.name,
      globalSettings.checkDark(),
    );
  }

  public checkDarkModeStem(url: Url): boolean {
    return this.checkUrlStemForFieldBool(
      url,
      this.fields.darkMode.name,
      globalSettings.checkDark(),
    );
  }

  // Special case for auto dark detection
  public checkDarkModeIsUndefined(url: Url): boolean {
    const result = this.checkUrlForField(url, this.fields.darkMode.name);
    if (result === QueryResult.Undefined) {
      return true;
    }
    return false;
  }

  // Special case for auto dark detection
  public checkDarkModeStemIsUndefined(url: Url): boolean {
    const result = this.checkUrlStemForField(url, this.fields.darkMode.name);
    if (result === QueryResult.Undefined) {
      return true;
    }
    return false;
  }

  public checkHueRotate(url: Url): boolean {
    // If the stem and the url are undefined turn hue rotate ON!
    return this.checkUrlForFieldBool(
      url,
      this.fields.hueRotate.name,
      globalSettings.checkHue(),
    );
  }

  public checkHueRotateStem(url: Url): boolean {
    return this.checkUrlStemForFieldBool(
      url,
      this.fields.hueRotate.name,
      globalSettings.checkHue(),
    );
  }

  public getContrast(url: Url): number {
    const result = this.checkUrlForField(url, SettingId.Field.Contrast);
    const stemResult = this.checkUrlStemForField(url, SettingId.Field.Contrast);
    if (result !== QueryResult.Undefined) {
      return result;
    } else if (stemResult !== QueryResult.Undefined) {
      return stemResult;
    }
    return SettingId.Default.Contrast;
  }

  public getContrastStem(url: Url): number {
    const result = this.checkUrlStemForField(url, SettingId.Field.Contrast);
    if (result !== QueryResult.Undefined) {
      return result;
    }
    return SettingId.Default.Contrast;
  }

  public setContrast(url: Url, value: number) {
    this.setUrlFieldToValue(
      url,
      SettingId.Field.Contrast,
      value,
      SettingId.Type.Contrast,
      SettingId.Default.Contrast,
    );
  }

  public setContrastStem(url: Url, value: number) {
    this.setUrlStemFieldToValue(
      url,
      SettingId.Field.Contrast,
      value,
      SettingId.Type.Contrast,
      SettingId.Default.Contrast,
    );
  }

  // Helper function for toggle
  private isQueryUndefined(input: QueryResult) {
    if (input === QueryResult.Undefined) {
      return true;
    }
    return false;
  }

  // Helper function for toggle
  private allArgsFalse(...input: boolean[]) {
    for (var i = 0; i <= arguments.length; i++) {
      if (arguments[i] === true) {
        return false;
      }
    }
    return true;
  }

  private checkFieldIsBoolean(field: string) {
    if (this.fields[field].type != "boolean") {
      throw new Error(
        "Cannot toggle UrlSettings field: " +
          field +
          " because it is not of type boolean!",
      );
    }
  }

  private setUrlFieldToValue(
    url: Url,
    field: string,
    value: any,
    valueType: string,
    defaultValue: any,
    choice?: string,
  ) {
    // Verify the value we are setting matches the type that should be set
    if (typeof value != valueType) {
      if (debug) {
        console.log(
          "Aborting setFieldToValue. value's type does not match " + valueType,
        );
      }
    }
    // Testing which fields are undefined
    // Check if stem exists
    // Check if stem -> url exists
    // Check if stem -> url -> field exists
    const stem = this.isQueryUndefined(this.checkUrlStem(url));
    const stemUrl = this.isQueryUndefined(this.checkUrlStemForUrl(url));
    const stemUrlField = this.isQueryUndefined(
      this.checkUrlForField(url, field),
    );

    const urlStem = url.getStem();
    const cleanedUrl = url.getNormal();

    const isNotUndefined = this.allArgsFalse(true, true);

    if (debug) {
      console.log("stem: " + stem);
    }
    if (debug) {
      console.log("stemUrl: " + stemUrl);
    }
    if (debug) {
      console.log("stemUrlField: " + stemUrlField);
    }

    // The value exists, successfully run toggle
    if (this.allArgsFalse(stem, stemUrl, stemUrlField)) {
      if (choice === "toggle") {
        this.dataObject[urlStem][cleanedUrl][field] = !this.dataObject[urlStem][
          cleanedUrl
        ][field];
      } else {
        this.dataObject[urlStem][cleanedUrl][field] = value;
      }
    } else if (this.allArgsFalse(stem, stemUrl)) {
      // There is a stem and a url but no matching field
      // Create the field and insert the default value
      this.dataObject[urlStem][cleanedUrl][field] = value;
    } else if (this.allArgsFalse(stem)) {
      // There is only a stem
      // Create the url within the stem and add the field
      this.dataObject[urlStem][cleanedUrl] = {};
      this.dataObject[urlStem][cleanedUrl][field] = value;
    } else {
      // The is no record of the url
      this.dataObject[urlStem] = {};
      this.dataObject[urlStem][cleanedUrl] = {};
      this.dataObject[urlStem][cleanedUrl][field] = value;
    }
    this.save();
  }

  private toggleUrl(url: Url, field: string, defaultValue: boolean) {
    this.setUrlFieldToValue(
      url,
      field,
      defaultValue,
      "boolean",
      defaultValue,
      "toggle",
    );
  }

  private setUrlStemFieldToValue(
    url: Url,
    field: string,
    value: any,
    valueType: string,
    defaultValue: any,
    choice?: string,
  ) {
    // Verify the value we are setting matches the type that should be set
    if (typeof value != valueType) {
      if (debug) {
        console.log(
          "Aborting setFieldToValue. value's type does not match " + valueType,
        );
      }
    }

    // Check if stem exists
    // Check if stem -> field exists
    const stem = this.isQueryUndefined(this.checkUrlStem(url));
    const stemField = this.isQueryUndefined(
      this.checkUrlStemForField(url, field),
    );

    const urlStem = url.getStem();

    // The stem -> field exists, run toggle
    if (this.allArgsFalse(stem, stem_Field)) {
      if (choice === "toggle") {
        this.dataObject[urlStem][field] = !this.dataObject[urlStem][field];
      } else {
        this.dataObject[urlStem][field] = value;
      }
    } else if (this.allArgsFalse(stem)) {
      // The stem exists but the field doesn't
      this.dataObject[urlStem][field] = defaultValue;
    } else {
      // The is no record of the url Stem
      this.dataObject[urlStem] = {};
      this.dataObject[urlStem][field] = defaultValue;
    }
    this.save();
  }

  private toggleUrlStem(url: Url, field: string, defaultValue: boolean) {
    this.setUrlStemFieldToValue(
      url,
      field,
      defaultValue,
      "boolean",
      defaultValue,
      "toggle",
    );
  }

  public toggleDarkMode(url: Url) {
    // Dark mode is always on (true), so when it is toggled for the first
    // time set the value to off (false)
    this.toggleUrl(url, this.fields.darkMode.name, false);
  }

  public toggleDarkModeStem(url: Url) {
    this.toggleUrlStem(url, this.fields.darkMode.name, false);
  }

  public toggleHueRotate(url: Url) {
    this.toggleUrl(url, this.fields.hueRotate.name, false);
  }

  public toggleHueRotateStem(url: Url) {
    this.toggleUrlStem(url, this.fields.hueRotate.name, false);
  }

  // stem
  private removeStem(url: Url) {
    delete this.dataObject[url.getStem()];
    this.save();
  }

  // stem -> field
  private removeStemField(url: Url, field: string) {
    delete this.dataObject[url.getStem()][this.fields[field].name];
    this.save();
  }

  // stem -> url
  private removeUrl(url: Url) {
    delete this.dataObject[url.getStem()][url.getNormal()];
    this.save();
  }

  // stem -> url -> field
  private removeField(url: Url, field: string) {
    delete this.dataObject[url.getStem()][url.getNormal()][
      this.fields[field].name
    ];
    this.save();
  }

  public clearUrl(url: Url) {
    this.removeUrl(url);
  }

  public clearUrlStem(url: Url) {
    this.removeStem(url);
  }

  public clearDarkMode(url: Url) {
    this.removeField(url, this.fields.darkMode.name);
  }

  public clearDarkModeStem(url: Url) {
    this.removeStemField(url, this.fields.darkMode.name);
  }

  public clearHueRotate(url: Url) {
    this.removeField(url, this.fields.hueRotate.name);
  }

  public clearHueRotateStem(url: Url) {
    this.removeStemField(url, this.fields.hueRotate.name);
  }

  public getUrlState(url: Url): any {
    const result = {};

    result[SettingId.Field.Dark] = this.checkDarkMode(url);
    result[SettingId.Field.Hue] = this.checkHueRotate(url);
    result[SettingId.Field.Contrast] = this.getContrast(url);

    return result;
  }

  public getFrameState(rawUrls: string[]): any {
    // Iterate through urls to determine the dark and hue settings of
    // iframes embedded multiple levels into a page
    console.log(rawUrls);
    const url = new Url(rawUrls.shift());
    const currentState = this.getUrlState(url);

    // If the parent url is not dark no inversions are taking place, no
    // iteration necessary
    if (!currentState.Dark) {
      currentState.BaseFrameIsDark = false;
      return currentState;
    }
    currentState.BaseFrameIsDark = true;
    console.log(currentState);

    for (var rawUrl in rawUrls) {
      var nextUrl = new Url(rawUrls[rawUrl]);
      var nextState = this.getUrlState(nextUrl);

      // If an iframe is embedded one level deep it should needs to have
      // the inversion turned off (actually re inverted) so
      // true ^ true = false
      // And if an iframe is 2 levels deep it needs to have inversion
      // turned back on basically
      // (true ^ true) ^ true = true
      currentState.Dark = currentState.Dark ^ nextState.Dark;
      currentState.Hue = currentState.Hue ^ nextState.Hue;
      currentState.Contrast = nextState.Contrast;

      if (nextUrl.getFull() === "about:blank") {
        currentState.Hue = !currentState.Hue;
        currentState.Dark = !currentState.Dark;
      }
    }
    return currentState;
  }

  // Auto Dark Logging Specific
  public setCheckedAutoDark(url: Url): void {
    this.setUrlFieldToValue(
      url,
      SettingId.Field.CheckedAutoDark,
      true,
      SettingId.Type.CheckedAutoDark,
      SettingId.Default.CheckedAutoDark,
    );
    if (
      this.checkUrlStemForFieldBool(
        url,
        SettingId.Field.ShouldAutoDark,
        SettingId.Default.ShouldAutoDark,
      )
    ) {
      this.setStemShouldAutoDark(url);
    }
  }

  private setStemShouldAutoDark(url: Url): void {
    const siteObject = this.dataObject[url.getStem()];
    if (typeof siteObject !== "undefined") {
      if (Object.keys(siteObject).length >= AutoDark.MinDarkSites) {
        var darkSites = 0;
        for (var site in siteObject) {
          if (siteObject[site][SettingId.Field.CheckedAutoDark] == true) {
            darkSites++;
            if (darkSites >= AutoDark.MinDarkSites) {
              this.setUrlStemFieldToValue(
                url,
                SettingId.Field.ShouldAutoDark,
                false,
                SettingId.Type.ShouldAutoDark,
                SettingId.Default.ShouldAutoDark,
              );
              return;
            }
          }
        }
      }
    }
  }

  public getCheckedAutoDark(url: Url): boolean {
    return (
      this.checkUrlForFieldBool(
        url,
        SettingId.Field.CheckedAutoDark,
        SettingId.Default.CheckedAutoDark,
      ) ||
      this.checkUrlStemForFieldBool(
        url,
        SettingId.Field.ShouldAutoDark,
        SettingId.Default.ShouldAutoDark,
      )
    );
  }
}

// End UrlSettings Class -------------------------------------------------- }}}
// Url Class -------------------------------------------------------------- {{{

class Url {
  // Example input url: https://www.google.com/search?q=test
  private stem: string; // https://www.google.com -> protocol + hostname
  private domain: string; // google.com -> domain
  private normal: string; // https://www.google.com/search -> protocol + hostname + path, no query or fragment strings
  private full: string; // everything

  private shouldUpdateMenu: boolean;
  private shouldAutoDark: boolean;

  private defaultUrl = "about:blank";

  private updateBlacklist = ["chrome://", "chrome-extension://", "about:blank"];

  private parseBlacklist = ["chrome://", "chrome-extension://", "file://"];

  private autoDarkModeBlacklist = [".pdf"];

  constructor(newUrl?: string) {
    if (newUrl) {
      this.parse(newUrl);
    } else {
      this.parse(this.defaultUrl);
    }
  }

  public update(callback?: () => void) {
    if (debug) {
      console.log("Updating URL class url!");
    }
    try {
      chrome.tabs.query({ currentWindow: true, active: true }, tabs => {
        try {
          this.parse(tabs[0].url);
        } catch (e) {
          if (debug) {
            console.log("There is no valid url in tabs object: ");
          }
          if (debug) {
            console.log(tabs[0]);
          }
          if (debug) {
            console.log("The error is: " + e);
          }
        }
        callback();
      });
    } catch (e) {
      if (debug) {
        console.log("Cannot update url: " + e);
      }
    }
  }

  public parse(input: string) {
    // If the url has not changed, do nothing
    if (input === this.full) {
      return;
    }

    // Test url against parseBlacklist
    const inParseBlacklist = this.inputInList(input, this.parseBlacklist);
    if (inParseBlacklist.result) {
      this.stem = this.domain = this.normal = this.full = this.parseBlacklist[
        inParseBlacklist.position
      ];
    } else {
      try {
        const url = new URI(input).normalize();
        this.stem = new URI({
          protocol: url.protocol(),
          hostname: url.hostname(),
        }).toString();

        // If the subdomain is not www start the domain with that
        const subdomain = url.subdomain();
        if (subdomain !== "www" && subdomain.length > 0) {
          this.domain = subdomain + "." + url.domain();
        } else {
          this.domain = url.domain();
        }

        this.normal = new URI({
          protocol: url.protocol(),
          hostname: url.hostname(),
          path: url.path(),
        }).toString();

        this.full = url.toString();
      } catch (e) {
        if (debug) {
          console.log(
            "Error parsing potential url: " + input + " Error is: " + e,
          );
        }
        this.stem = this.domain = this.normal = this.full = this.defaultUrl;
      }
    }
    this.setShouldUpdateMenu(input);
    this.setShouldAutoDark(input);
  }

  public inputInList(input: string, list: string[]): any {
    for (let i = 0; i < list.length; i++) {
      if (input.indexOf(list[i]) > -1) {
        return { result: true, position: i };
      }
    }
    return { result: false, position: -1 };
  }

  public setShouldAutoDark(input: string) {
    this.shouldAutoDark = !this.inputInList(input, this.autoDarkModeBlacklist)
      .result;
  }

  public setShouldUpdateMenu(input: string) {
    this.shouldUpdateMenu = !this.inputInList(input, this.updateBlacklist)
      .result;
  }

  public getFull(): string {
    return this.full;
  }

  public getStem(): string {
    return this.stem;
  }

  public getDomain(): string {
    if (debug) {
      console.log("Getting domain: " + this.domain);
    }
    return this.domain;
  }

  public getNormal(): string {
    return this.normal;
  }

  public getShouldAutoDark(): boolean {
    return this.shouldAutoDark;
  }

  public getShouldUpdateMenu() {
    return this.shouldUpdateMenu;
  }
}

// End Url Class ---------------------------------------------------------- }}}
// BackgroundReceiver ------------------------------------------------- {{{

class BackgroundReceiver extends Message {
  private static urlTree: UrlTree;

  public static init(inputUrlTree: UrlTree) {
    BackgroundReceiver.urlTree = inputUrlTree;
    BackgroundReceiver.receiveContentUrl();
    BackgroundReceiver.receiveAutoDark();
    BackgroundReceiver.receiveRequestState();
    BackgroundReceiver.receivePopupToggle();
    BackgroundReceiver.receivePopupClear();
    BackgroundReceiver.receiveChangeField();
  }

  //  Receive Content Url ------------------------------------------------ {{{

  public static receiveContentUrl() {
    Message.receive(
      Message.Sender.ContentPage,
      Message.Receiver.Background,
      Message.Intent.InitContent,
      BackgroundReceiver.handleReceiveContentUrl,
    );
  }

  public static handleReceiveContentUrl(message: any, tabId: number, frameId: number) {
    if (tabId !== undefined && frameId !== undefined) {
      urlTree.updateTab(tabId, () => {
        ContentAction.checkDarkMode(new Url(message.Data.Url), tabId, frameId);
      });
    }
  }

  //  End Receive Content Url -------------------------------------------- }}}
  //  Receive Auto Dark Init --------------------------------------------- {{{

  public static receiveAutoDark() {
    Message.receive(
      Message.Sender.ContentPage,
      Message.Receiver.Background,
      Message.Intent.InitAutoDark,
      BackgroundReceiver.handleReceiveAutoDark,
    );
  }

  public static handleReceiveAutoDark(message: any, tabId: number) {
    // Check if:
    // The url exists
    // Running from parent frame
    // The url is also the current url, making sure not to take a
    // screenshot of a background page
    if (debug) {
      console.log(
        'typeof(message.Data.Url) != "undefined":\t\t\t\t',
        typeof message.Data.Url !== "undefined",
      );
      console.log(
        "message.Data.Url === message.Data.FrameUrl:\t\t\t\t",
        message.Data.Url === message.Data.FrameUrl,
      );
      console.log(
        "message.Data.Url === currentUrl.getFull():\t\t\t\t",
        message.Data.Url === currentUrl.getFull(),
      );
      console.log("");
    }

    if (
      typeof message.Data.Url !== "undefined" &&
      message.Data.Url === message.Data.FrameUrl &&
      message.Data.Url === currentUrl.getFull()
    ) {
      autoDark.check(currentUrl, urlSettings, () => {
        ContentAction.toggleDarkMode(currentUrl);
      });
    }
  }

  //  End Receive Auto Dark Init ----------------------------------------- }}}
  //  Receive Request State ---------------------------------------------- {{{

  public static receiveRequestState() {
    Message.receive(
      Message.Sender.Popup,
      Message.Receiver.Background,
      Message.Intent.RequestState,
      BackgroundReceiver.handleRequestState,
    );
  }

  public static handleRequestState(message: any) {
    state.update(currentUrl, urlSettings, globalSettings, () => {
      BackgroundSender.sendState();
    });
  }

  //  End Receive Request State ------------------------------------------ }}}
  //  Receive Popup Toggle ---------------------------------------------- {{{

  public static receivePopupToggle() {
    Message.receive(
      Message.Sender.Popup,
      Message.Receiver.Background,
      Message.Intent.ToggleField,
      BackgroundReceiver.handlePopupToggle,
    );
  }

  public static handlePopupToggle(message) {
    switch (message.Data.Group) {
      // Current Url Toggle
      case SettingId.Group.CurrentUrl:
        switch (message.Data.Field) {
          case SettingId.Field.Dark:
            ContentAction.toggleDarkMode(currentUrl);
            break;
          case SettingId.Field.Hue:
            ContentAction.toggleHue(currentUrl);
            break;
        }
        break;
      // Stem Url Toggle
      case SettingId.Group.StemUrl:
        switch (message.Data.Field) {
          case SettingId.Field.Dark:
            ContentAction.toggleDarkModeStem(currentUrl);
            break;
          case SettingId.Field.Hue:
            ContentAction.toggleHueStem(currentUrl);
            break;
        }
        break;
      // Global Toggle
      case SettingId.Group.Global:
        switch (message.Data.Field) {
          case SettingId.Field.AutoDark:
            globalSettings.toggleAutoDark();
            break;
          case SettingId.Field.LogAutoDark:
            globalSettings.toggleLogAutoDark();
            break;
          case SettingId.Field.Dark:
            globalSettings.toggleDark();
            BackgroundReceiver.updatePopupAndContent();
            break;
          case SettingId.Field.ShowNotifications:
            globalSettings.toggleShowNotifications();
            BackgroundReceiver.updatePopupAndContent();
            break;
          case SettingId.Field.Hue:
            globalSettings.toggleHue();
            BackgroundReceiver.updatePopupAndContent();
            break;
        }
        break;
    }
  }

  public static updatePopupAndContent() {
    state.update(currentUrl, urlSettings, globalSettings, () => {
      BackgroundSender.sendState();
      ContentAction.checkDarkModeForActiveTab(currentUrl);
    });
  }

  //  End Receive Popup Toggle ------------------------------------------ }}}
  //  Receive Popup Clear ----------------------------------------------- {{{

  public static receivePopupClear() {
    Message.receive(
      Message.Sender.Popup,
      Message.Receiver.Background,
      Message.Intent.ResetGroup,
      BackgroundReceiver.handleReceivePopupClear,
    );
  }

  public static handleReceivePopupClear(message) {
    if (debug) {
      console.log("Received popupClear message in destination!");
    }
    if (debug) {
      console.log("message:");
    }
    if (debug) {
      console.log(message);
    }
    switch (message.Data) {
      case SettingId.Group.CurrentUrl:
        urlSettings.clearUrl(currentUrl);
        BackgroundReceiver.updatePopupAndContent();
        break;
      case SettingId.Group.StemUrl:
        urlSettings.clearUrlStem(currentUrl);
        BackgroundReceiver.updatePopupAndContent();
        break;
      case SettingId.Group.Global:
        // TODO:
        // This should clear urlSettings.
        break;
    }
  }

  //  End Receive Popup Clear ------------------------------------------- }}}
  //  Receive Change Field ---------------------------------------------- {{{

  public static receiveChangeField() {
    if (debug) {
      console.log("receiveChangeField");
    }
    Message.receive(
      Message.Sender.Popup,
      Message.Receiver.Background,
      Message.Intent.ChangeField,
      BackgroundReceiver.handleReceiveChangeField,
    );
  }

  public static handleReceiveChangeField(message) {
    switch (message.Data.Group) {
      case SettingId.Group.CurrentUrl:
        switch (message.Data.Field) {
          case SettingId.Field.Contrast:
            // Set Contrast value
            urlSettings.setContrast(currentUrl, message.Data.Value);
            break;
        }
        break;
      case SettingId.Group.StemUrl:
        switch (message.Data.Field) {
          case SettingId.Field.Contrast:
            // Set Contrast value for stem
            urlSettings.setContrastStem(currentUrl, message.Data.Value);
            break;
        }
        break;
    }

    ContentAction.checkDarkModeForActiveTab(currentUrl);
  }

  //  End Receive Change Field ------------------------------------------ }}}
}

// End BackgroundReceiver --------------------------------------------- }}}
// BackgroundSender --------------------------------------------------- {{{

class BackgroundSender extends Message {
  public static sendState() {
    const dataPackage = state.pack();
    if (debug) {
      console.log("Sending state to popup");
    }
    if (debug) {
      console.log(dataPackage);
    }
    Message.send(
      Message.Sender.Background,
      Message.Receiver.Popup,
      Message.Intent.SendState,
      dataPackage,
    );
  }
}

// End BackgroundSender ----------------------------------------------- }}}
// State -------------------------------------------------------------- {{{

class State extends DefaultState {
  public update(
    url: Url,
    settings: UrlSettings,
    globalSettings: GlobalSettings,
    callback: () => void,
  ): void {
    this.urlFull = url.getNormal();
    this.urlStem = url.getDomain();

    this.currentUrlDark = settings.checkDarkMode(url);
    this.currentUrlHue = settings.checkHueRotate(url);
    this.currentUrlContrast = settings.getContrast(url);

    // Stem Url Settings
    this.stemUrlDark = settings.checkDarkModeStem(url);
    this.stemUrlHue = settings.checkHueRotateStem(url);
    this.stemUrlContrast = settings.getContrastStem(url);

    // Global Dark Mode Settings
    this.globalDark = globalSettings.checkDark();
    this.globalAutoDark = globalSettings.checkAutoDark();
    this.globalLogAutoDark = globalSettings.checkLogAutoDark();
    this.globalShowNotifications = globalSettings.checkShowNotifications();
    this.globalHue = globalSettings.checkHue();
    const globalContrast = 99;
    this.globalContrast = globalContrast;
    this.updateKeyboardShortcut(callback);
  }

  public updateKeyboardShortcut(callback: () => void) {
    chrome.commands.getAll(commands => {
      this.globalKeyboardShortcut = commands[1]["shortcut"];
      callback();
    });
  }
}

// End State ---------------------------------------------------------- }}}
// ContentAction ---------------------------------------------------------- {{{

class ContentAction {
  public static urlTree: UrlTree;

  public static init(inputUrlTree: UrlTree) {
    ContentAction.urlTree = inputUrlTree;
  }

  public static checkDarkMode(url: Url, tabId: number, frameId: number): void {
    const parentUrls = ContentAction.urlTree.getParentUrls(tabId, frameId);
    ContentAction.getStateForUrl(url, tabId, frameId, parentUrls);
  }

  public static checkDarkModeForActiveTab(url: Url): void {
    ContentAction.getStateForActiveTab(url);
  }

  public static toggleDarkMode(url: Url): void {
    urlSettings.toggleDarkMode(url);
    ContentAction.getStateForActiveTab(url);
  }

  public static toggleDarkModeStem(url: Url): void {
    urlSettings.toggleDarkModeStem(url);
    ContentAction.getStateForActiveTab(url);
  }

  public static toggleHue(url: Url): void {
    urlSettings.toggleHueRotate(url);
    ContentAction.getStateForActiveTab(url);
  }

  public static toggleHueStem(url: Url): void {
    urlSettings.toggleHueRotateStem(url);
    ContentAction.getStateForActiveTab(url);
  }

  // This should only be called from anywhere but the content page, If this
  // is called from the content page some insane amount of function calls
  // would happen
  public static getStateForActiveTab(url: Url) {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tab) {
      // Frame id of 0 is the base frame
      const tabId = tab[0].id;

      ContentAction.urlTree.updateTab(tabId, function() {
        var frameData = ContentAction.urlTree.getAllFrameData(tabId);
        console.log(frameData);
        for (var frame in frameData) {
          ContentAction.getStateForUrl(
            url,
            tabId,
            frameData[frame].frameId,
            frameData[frame].parentUrls,
          );
        }
      });
    });
  }

  public static getStateForUrl(
    url: Url,
    tabId: number,
    frameId: number,
    parentUrls: string[],
  ) {
    let isIFrame = false;
    console.log(parentUrls);
    let urlState;
    if (parentUrls.length <= 1) {
      urlState = urlSettings.getUrlState(url);
    } else {
      // Determine what css settings should be sent to the current frame
      // based on parent frame settings
      urlState = urlSettings.getFrameState(parentUrls.reverse());
      isIFrame = true;
    }

    if (state !== undefined) {
      ContentAction.handleDataForTab(state, tabId, frameId, isIFrame);
    }
  }

  public static handleDataForTab(
    state: {
      Dark: boolean;
      Hue: boolean;
      Contrast: number;
      BaseFrameIsDark?: boolean;
    },
    tabId: number,
    frameId: number,
    isIFrame: boolean,
  ) {
    if (!isIFrame) {
      if (state.Dark) {
        Icon.turnOn();
      } else {
        Icon.turnOff();
      }
    }

    let cssString;
    if (isIFrame) {
      cssString = CssBuilder.buildForIFrame(
        state.Dark,
        state.Hue,
        state.Contrast,
        state.BaseFrameIsDark,
      );
      // The state that we get for iframes has to do with how many
      // levels they are embedded within the parent page, but the
      // javascript just needs to tell the frame that it is dark. This
      // passes dark to the js so html[data-dark-mode-active="true"]
      if (state.BaseFrameIsDark) {
        state.Dark = true;
      } else {
        state.Dark = false;
      }
    } else {
      cssString = CssBuilder.buildForBaseFrame(
        state.Dark,
        state.Hue,
        state.Contrast,
      );
    }

    const jsString = ContentAction.buildJsString(state.Dark);
    console.log("Iframe: " + isIFrame + ", Css: " + cssString);

    ContentAction.updateContentPage(jsString, cssString, tabId, frameId);
  }

  private static buildJsString(Dark: boolean) {
    return `
            darkModeContentManager.updateAttributes(${Dark});
        `;
  }

  private static passError(error: string, passableErrors: string[]) {
    for (const x in passableErrors) {
      if (error.indexOf(passableErrors[x]) !== -1) {
        return true;
      }
    }
    return false;
  }

  private static parseErrors() {
    const errorsToCatch = ["No frame with id", "Cannot access contents of url"];

    if (chrome.runtime.lastError) {
      const error = chrome.runtime.lastError.message;
      if (!ContentAction.passError(error, errorsToCatch)) {
        console.log(error);
      }
    }
  }

  private static updateContentPage(
    jsString: string,
    cssString: string,
    tabId: number,
    frameId: number,
  ) {
    if (jsString.length > 0) {
      chrome.tabs.executeScript(
        tabId,
        {
          frameId: frameId,
          code: jsString,
          allFrames: true,
          matchAboutBlank: true,
          runAt: "document_start",
        },
        ContentAction.parseErrors,
      );
    }

    if (cssString.length > 0) {
      chrome.tabs.insertCSS(
        tabId,
        {
          frameId: frameId,
          code: cssString,
          allFrames: true,
          matchAboutBlank: true,
          runAt: "document_start",
        },
        ContentAction.parseErrors,
      );
    }
  }
}
// End ContentAction ------------------------------------------------------ }}}
// Url Tree ---------------------------------------------------------- {{{

class UrlTree {
  private tree: any;

  constructor() {
    this.tree = {};
    this.populate();
  }

  public populate(): void {
    chrome.tabs.query({}, tabs => {
      for (var tab in tabs) {
        var thisTabId = tabs[tab].id;

        this.tree[thisTabId] = {};

        this.convertFrameIdsToParentUrls(thisTabId);
      }
    });
  }

  public addActiveTab(): void {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      const thisTabId = tabs[0].id;

      // Reset the tab with new frameIds.
      this.tree[thisTabId] = {};

      this.convertFrameIdsToParentUrls(thisTabId);
    });
  }

  public updateTab(tabId: number, callback: any) {
    if (this.tree[tabId] === undefined) {
      this.tree[tabId] = {};
    }

    this.convertFrameIdsToParentUrls(tabId, callback);
  }

  private convertFrameIdsToParentUrls(thisTabId: number, callback?: any) {
    chrome.webNavigation.getAllFrames({ tabId: thisTabId }, frames => {
      for (var frame in frames) {
        this.tree[thisTabId][frames[frame].frameId] = {
          url: frames[frame].url,
          parentId: frames[frame].parentFrameId,
        };
      }
      if (callback !== undefined) {
        callback();
      }
    });
  }

  // The structure here is really important for finding the nest level of an
  // iframe.
  // tabId: {
  //     frameId: {
  //         url,
  //         parentId,
  //     },
  //     frameId: {
  //         url,
  //         parentId,
  //     }, ...
  // }
  public add(url: string, parentUrl: string, tabId: number, frameId: number): void {
    if (this.tree[tabId] === undefined) this.tree[tabId] = {};
    console.log("Add:");
    console.log("url: " + url);
    console.log("parentUrl: " + parentUrl);

    if (frameId === 0) {
      this.tree[tabId][frameId] = {
        url: url,
        parentId: -1,
      };
    }

    // How do you find the parentId from the parentUrl
    var tabData = {};
    for (var frame in this.tree[tabId]) {
      var frameUrl = this.tree[tabId][frame].url;
      tabData[frameUrl] = frame;
    }

    this.tree[tabId][frameId] = {
      url: url,
      // "parentUrl": parentUrl,
      parentId: parseInt(tabData[parentUrl]),
    };
  }

  public getParentUrls(tabId: number, frameId: number): string[] {
    let currentFrameId = frameId;
    let currentFrameLevel = 0;
    const maxLevel = 20;
    const parentUrls = [this.tree[tabId][frameId].url];
    while (
      !this.isBaseFrame(tabId, currentFrameId) &&
      currentFrameLevel < maxLevel
    ) {
      // Set the currentFrameId to the parentId of this frame,
      // getting one frame closer to the parent url
      // currentFrameId = this.tree[tabId][frameId].parentId
      currentFrameId = this.tree[tabId][currentFrameId].parentId;
      try {
        parentUrls.push(this.tree[tabId][currentFrameId].url);
      } catch (e) {
        if (e instanceof TypeError) {
          // pass
        }
      }
      currentFrameLevel++;
    }
    return parentUrls;
  }

  public getAllFrameData(tabId: number): any {
    const result = [];

    if (this.tree[tabId] === undefined) return result;
    var tabData = this.tree[tabId];
    const tabData = this.tree[tabId];

    for (var frameId in tabData) {
      result.push({
        frameId: parseInt(frameId),
        parentUrls: this.getParentUrls(tabId, frameId),
      });
    }

    return result;
  }

  private isBaseFrame(tabId: number, frameId: number): boolean {
    const frameData = this.tree[tabId][frameId];

    // A base frame matches these characteristics:
    // frameId is 0
    // frame has no parent (undefined), more likely this is an abnormal
    // frame, but it IS a base frame
    // parentId is -1 (there is no parent)
    if (frameId === 0) {
      return true;
    }
    // This has to be checked before checking the parentId to avoid
    // accessing an element from undefined
    if (frameData === undefined) {
     return true;
    }
    if (frameData.parentId === -1) {
      return true;
    }

    return false;
  }

  private getParentUrl(tabId: number, frameId: number): string {
    const parentId = this.tree[tabId][frameId].parentId;
    return this.tree[tabId][parentId].url;
  }

  public print(): void {
    console.log(this.tree);
  }
}

//  End Url Tree ------------------------------------------------------ }}}
// Browser Action ---------------------------------------------------------- {{{

function deactivateBrowserAction() {
  if (debug) {
    console.log("Deactivating browser action!");
  }
  chrome.tabs.getSelected(null, (tab) => {
    chrome.browserAction.disable(tab.id);
    chrome.browserAction.setIcon({
      path: {
        19: "img/dark-mode-inactive-19.png",
        38: "img/dark-mode-inactive-38.png",
      },
      tabId: tab.id,
    });
  });
}

function activateBrowserAction() {
  if (debug) {
    console.log("Activating browser action!");
  }
  chrome.tabs.getSelected(null, (tab) => {
    chrome.browserAction.enable(tab.id);
    chrome.browserAction.setIcon({
      path: {
        19: "img/dark-mode-on-19.png",
        38: "img/dark-mode-on-38.png",
      },
      tabId: tab.id,
    });
  });
}

// End Browser Action ------------------------------------------------------ }}}
// Listen for Keystrokes --------------------------------------------------- {{{

chrome.commands.onCommand.addListener((command) => {
  switch (command) {
    case "toggle-dark-mode":
      if (debug) {
        console.log("Keyboard Shortcut caught");
      }
      ContentAction.toggleDarkMode(currentUrl);
      break;
  }
});

// End Listen for Keystrokes ----------------------------------------------- }}}
// AutoDark Class ---------------------------------------------------- {{{

class AutoDark {
  private static brightnessThreshold = 50;
  private static runInterval = 1000; // ms
  private static stemRunInterval = 10000; // ms

  // I can't find the cause, but something causes many of these functions
  // to run multiple times. To fix this, function execution times are
  // tracked below and functions are ran through the `throttle` function
  // to determine if they should execute again based on their previous
  // execution time.
  private static lastIsCorrectNotification = Date.now();
  private static lastStemNotification = Date.now();
  private static lastRun = Date.now();
  private static ResembleLastRun = Date.now();
  private static lastCheck = Date.now();

  // Number of sites UrlSettings checks before it marks a stem as dark
  public static MinDarkSites = 5;

  public check(url: Url, urlSettings: UrlSettings, lightCallback: () => void): void {
    if (
      url.getShouldAutoDark() &&
      urlSettings.checkDarkModeIsUndefined(url) &&
      urlSettings.checkDarkModeStemIsUndefined(url) &&
      globalSettings.checkAutoDark() &&
      !AutoDark.throttle(AutoDark.lastCheck, AutoDark.runInterval) &&
      !urlSettings.getCheckedAutoDark(url)
    ) {
      AutoDark.measureBrightnessOfCurrentTab(
        url,
        urlSettings,
        AutoDark.parseBrightness,
      );
      AutoDark.lastCheck = Date.now();
    }
  }

  public static measureBrightnessOfCurrentTab(
    url: Url,
    urlSettings: UrlSettings,
    brightnessCallback: (Url, number) => void,
  ) {
    // captureVisibleTab cannot capture screenshots of background tabs
    // so the url we are checking must match the current url
    if (
      currentUrl.getFull() === url.getFull() &&
      !AutoDark.throttle(AutoDark.ResembleLastRun, AutoDark.runInterval)
    ) {
      chrome.tabs.captureVisibleTab(screenshot => {
        resemble(screenshot).onComplete(data => {
          urlSettings.setCheckedAutoDark(url);
          AutoDark.ResembleLastRun = Date.now();
          brightnessCallback(url, data.brightness);
        });
      });
    }
  }

  public static throttle(lastRun: number, interval: number) {
    if (Date.now() < interval + lastRun) {
      return true;
    }
    return false;
  }

  public static parseBrightness(url: Url, brightness: number) {
    // If the page is light, toggle the page to darkness
    if (
      brightness > AutoDark.brightnessThreshold &&
      !AutoDark.throttle(AutoDark.lastRun, AutoDark.runInterval)
    ) {
      ContentAction.toggleDarkMode(url);
      AutoDark.startNotifications(url);
    }
    AutoDark.lastRun = Date.now();
  }

  public static startNotifications(url: Url) {
    if (globalSettings.checkShowNotifications()) {
      AutoDark.pageLooksCorrectNotification(url);
    }
  }

  public static pageLooksCorrectNotification(url: Url) {
    if (
      !AutoDark.throttle(
        AutoDark.lastIsCorrectNotification,
        AutoDark.runInterval,
      )
    ) {
      AutoDark.lastIsCorrectNotification = Date.now();
      chrome.notifications.create(
        "",
        {
          type: "basic",
          iconUrl: "img/dark-mode-on-128.png",
          title: "Dark Mode",
          message: "Does this page look right?",
          buttons: [{ title: "Yes" }, { title: "No" }],
        },
        (notificationId) => {
          chrome.notifications.onButtonClicked.addListener((
            notifId,
            buttonIndex,
            ) => {
            // Yes Click
            if (buttonIndex === 0) {
              chrome.notifications.clear(notifId);
              AutoDark.toggleStemNotification();
            }

            // No Click
            if (buttonIndex === 1) {
              console.log("No Click!");
              ContentAction.toggleDarkMode(url);
              chrome.notifications.clear(notifId);
            }
          });
        },
      );
    }
  }

  public static toggleStemNotification() {
    if (
      !AutoDark.throttle(
        AutoDark.lastStemNotification,
        AutoDark.stemRunInterval,
      )
    ) {
      AutoDark.lastStemNotification = Date.now();
      chrome.notifications.create(
        "",
        {
          type: "basic",
          iconUrl: "img/dark-mode-on-128.png",
          title: "Dark Mode",
          message:
            "Turn off dark mode for all " + currentUrl.getDomain() + " urls?",
          buttons: [{ title: "Yes" }, { title: "No" }],
        },
        (notificationId) => {
          chrome.notifications.onButtonClicked.addListener((
            notifId,
            buttonIndex,
            ) => {
            // Yes Click
            if (buttonIndex === 0) {
              ContentAction.toggleDarkModeStem(currentUrl);
              chrome.notifications.clear(notifId);
            } else {
              chrome.notifications.clear(notifId);
            }
          });
        },
      );
    }
  }
}

// End AutoDark Class ------------------------------------------------ }}}
// Icon --------------------------------------------------------------- {{{

class Icon {
  public static turnOn() {
    chrome.browserAction.setIcon({
      path: {
        19: "img/dark-mode-on-19.png",
        38: "img/dark-mode-on-38.png",
      },
    });
  }

  public static turnOff() {
    chrome.browserAction.setIcon({
      path: {
        19: "img/dark-mode-off-19.png",
        38: "img/dark-mode-off-38.png",
      },
    });
  }
}

//  End Icon ----------------------------------------------------------- }}}
// Context (Right Click) Menus --------------------------------------------- {{{

// Setup Basic Toggle context menu
function createToggleDarkModeContextMenu() {
  chrome.contextMenus.create({
    id: "toggleDarkMode",
    title: "Toggle Dark Mode",
    onclick: () => {
      ContentAction.toggleDarkMode(currentUrl);
    },
    contexts: ["all"],
  });
}
createToggleDarkModeContextMenu();

// For the Toggle stem menu item to have the current url within the menu
// text the context menu must first be created (`chrome.contextMenus.create`)
// and then updated on when the tab or window changes.
//
// Choosing what events update this menu is tricky. There is no definitive
// one tab event or window event that satifies a window or tab "change".
// Therefore multiple events are listening to call the
// `updateContextMenuAndBrowserAction` function. That function is rate limited
// by waiting at least 10ms to call `context.contextMenus.update`.
//
// There is probably a better way to do this, but this works for now.

function createToggleStemContextMenu() {
  chrome.contextMenus.create({
    id: "toggleStemFromContextMenu",
    title: "Toggle Dark Mode for all " + currentUrl.getDomain() + " urls",
    onclick: () => {
      ContentAction.toggleDarkModeStem(currentUrl);
    },
    contexts: ["all"],
  });
}

let updateContextMenuToggleUrlStemTimestamp = Date.now();
const updateIntervalMs = 10;

let showContextMenus = true;
let contextMenusRemoved = false;

function updateContextMenuAndBrowserAction() {
  // My solution to rate limit changing this too often
  // If one of the events triggers this function don't do it again for
  // `updateIntervalMs` milliseconds.
  if (Date.now() > updateContextMenuToggleUrlStemTimestamp + updateIntervalMs) {
    currentUrl.update(() => {
      if (currentUrl.getShouldUpdateMenu()) {
        if (showContextMenus) {
          // Update the relevant context menus
          chrome.contextMenus.update("toggleStemFromContextMenu", {
            title:
              "Toggle Dark Mode for all " + currentUrl.getDomain() + " urls",
          });
        } else {
          // Create all context menus and browser action
          showContextMenus = true;
          createToggleDarkModeContextMenu();
          createToggleStemContextMenu();
          activateBrowserAction();
          contextMenusRemoved = false;
        }
      } else {
        // Remove both context menus and browser action
        showContextMenus = false;
        if (!contextMenusRemoved) {
          deactivateBrowserAction();
          chrome.contextMenus.remove("toggleDarkMode");
          chrome.contextMenus.remove("toggleStemFromContextMenu");
          contextMenusRemoved = true;
        }
      }
    });
    updateContextMenuToggleUrlStemTimestamp = Date.now();
  }
}

// End Context (Right Click) Menus ----------------------------------------- }}}
// Context Menu Events ----------------------------------------------------- {{{

chrome.tabs.onHighlighted.addListener(() => {
  updateContextMenuAndBrowserAction();
});

chrome.tabs.onUpdated.addListener(() => {
  updateContextMenuAndBrowserAction();
});
chrome.tabs.onActivated.addListener(() => {
  updateContextMenuAndBrowserAction();
});

chrome.windows.onCreated.addListener(() => {
  updateContextMenuAndBrowserAction();
});

chrome.windows.onFocusChanged.addListener(() => {
  updateContextMenuAndBrowserAction();
});

chrome.contextMenus.onClicked.addListener(() => {
  updateContextMenuAndBrowserAction();
});

// End Context Menu Events ------------------------------------------------- }}}
//  Utils ---------------------------------------------------------------{{{

const ParseIntBase10 = (input: string): number => {
  const base = 10;
  return parseInt(input, base);
};

//  End Utils -----------------------------------------------------------}}}
// Main ------------------------------------------------------------------- {{{

const debug = false;
const startupTimeout = 5;

setTimeout(() => {
  updateContextMenuAndBrowserAction();
  if (debug) {
    console.log("Hello from Typescript!");
  }
}, startupTimeout);

const globalSettings = new GlobalSettings();
const urlSettings = new UrlSettings(globalSettings);
const autoDark = new AutoDark();

const currentUrl = new Url();

const urlTree = new UrlTree();

BackgroundReceiver.init(urlTree);
ContentAction.init(urlTree);

const state = new State();

currentUrl.update(() => {
  createToggleStemContextMenu();
  state.update(currentUrl, urlSettings, globalSettings, function() {});
});

// End Main --------------------------------------------------------------- }}}

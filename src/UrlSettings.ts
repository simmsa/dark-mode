import AutoDark from "./AutoDark";
import PersistentStorage from "./PersistentStorage";
import SettingId from "./SettingId";
import Url from "./Url";

// tslint:disable:no-console
const debug = false;

// I would like to put this inside the `UrlSettings` class but typescript does
// not allow this.
export enum QueryResult {
  True,
  False,
  Undefined,
}

class UrlSettings extends PersistentStorage {
  private fields: any;

  constructor() {
    super("urlInfo");
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
  // tslint:disable:member-ordering
  private isQueryUndefined(input: QueryResult) {
    if (input === QueryResult.Undefined) {
      return true;
    }
    return false;
  }

  // Helper function for toggle
  private allArgsFalse(...input: boolean[]) {
    let result = true;

    // Convert `arguments` into a mappable array
    Array.prototype.slice.call(arguments).map((arg) => {
      if (arg === true) {
        result = false;
      }
    });
    return result;
  }

  // private checkFieldIsBoolean(field: string) {
  //   if (this.fields[field].type !== "boolean") {
  //     throw new Error(
  //       "Cannot toggle UrlSettings field: " +
  //         field +
  //         " because it is not of type boolean!",
  //     );
  //   }
  // }

  private setUrlFieldToValue(
    url: Url,
    field: string,
    value: any,
    valueType: string,
    // defaultValue: any,
    choice?: string,
  ) {
    // Verify the value we are setting matches the type that should be set
    if (typeof value !== valueType) {
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

    // const isNotUndefined = this.allArgsFalse(true, true);

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
      // defaultValue,
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
    if (typeof value !== valueType) {
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
    if (this.allArgsFalse(stem, stemField)) {
      this.dataObject[urlStem][field] = choice === "toggle" ? !this.dataObject[urlStem][field] : value;
      // if (choice === "toggle") {
      //   this.dataObject[urlStem][field] = !this.dataObject[urlStem][field];
      // } else {
      //   this.dataObject[urlStem][field] = value;
      // }
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
    const url = new Url(rawUrls.shift());
    const currentState = this.getUrlState(url);

    // If the parent url is not dark no inversions are taking place, no
    // iteration necessary
    if (!currentState.Dark) {
      currentState.BaseFrameIsDark = false;
      return currentState;
    }
    currentState.BaseFrameIsDark = true;

    rawUrls.map((nextUrl) => {
      const parsedUrl = new Url(nextUrl);
      const nextState = this.getUrlState(parsedUrl);

      // If an iframe is embedded one level deep it should needs to have
      // the inversion turned off (actually re inverted) so
      // true ^ true = false
      // And if an iframe is 2 levels deep it needs to have inversion
      // turned back on basically
      // (true ^ true) ^ true = true
      // tslint:disable:no-bitwise
      currentState.Dark = currentState.Dark ^ nextState.Dark;
      currentState.Hue = currentState.Hue ^ nextState.Hue;
      currentState.Contrast = nextState.Contrast;

      if (parsedUrl.getFull() === "about:blank") {
        currentState.Hue = !currentState.Hue;
        currentState.Dark = !currentState.Dark;
      }
    });

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
        let darkSites = 0;
        for (const site in siteObject) {
          if (siteObject[site][SettingId.Field.CheckedAutoDark] === true) {
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

export default UrlSettings;

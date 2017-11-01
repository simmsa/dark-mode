import PersistentStorage from "./PersistentStorage";
import SettingId from "./SettingId";

class GlobalSettings extends PersistentStorage {
  constructor() {
    super("globalSettings");
  }

  private getField(field: string): any {
    return this.dataObject[field];
  }

  private toggleField(field: string, defaultValue: boolean): void {
    this.dataObject[field] = typeof this.getField(field) !== "undefined" ? !this.getField(field) : !defaultValue;
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

export default GlobalSettings;

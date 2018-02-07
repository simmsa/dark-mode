/*
 *  ____             _      __  __           _
 * |  _ \  __ _ _ __| | __ |  \/  | ___   __| | ___
 * | | | |/ _` | '__| |/ / | |\/| |/ _ \ / _` |/ _ \
 * | |_| | (_| | |  |   <  | |  | | (_) | (_| |  __/
 * |____/ \__,_|_|  |_|\_\ |_|  |_|\___/ \__,_|\___|
 *
 * Copyright (c) 2015-present, Andrew Simms
 * Author: Andrew Simms <simms.andrew@gmail.com>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

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
    this.dataObject[field] =
      typeof this.getField(field) !== "undefined"
        ? !this.getField(field)
        : !defaultValue;
    this.save();
  }

  private setField(field: string, value: any): void {
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

  public getContrast(): number {
    return this.checkField(
      SettingId.Field.Contrast,
      SettingId.Default.Contrast,
    );
  }

  public setContrast(newValue: number): void {
    this.setField(SettingId.Field.Contrast, newValue);
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

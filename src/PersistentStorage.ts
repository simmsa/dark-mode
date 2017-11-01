const debug = false;

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

export default PersistentStorage;

import Url from "../src/Url";

describe("Url class", () => {
  interface UrlResult {
    stem: string;
    domain: string;
    normal: string;
    full: string;
    shouldAutoDark: boolean;
    shouldUpdateMenu: boolean;
  }

  const testUrl = (url: string, expectedResult: UrlResult) => {
    const parsedUrl = new Url(url);
    Object.keys(expectedResult).map(key => {
      test(`Parses the ${key} url correctly`, () => {
        expect(parsedUrl[key]).toBe(expectedResult[key]);
      });
    });
  };

  describe("Basic functionality", () => {
    const googleUrl = "https://google.com/search?query=test";
    testUrl(googleUrl, {
      domain: "google.com",
      full: googleUrl,
      normal: "https://google.com/search",
      shouldAutoDark: true,
      shouldUpdateMenu: true,
      stem: "https://google.com",
    });
  });

  describe("Subdomains", () => {
    const googleUrl = "https://photos.google.com/search?query=test";
    testUrl(googleUrl, {
      domain: "photos.google.com",
      full: googleUrl,
      normal: "https://photos.google.com/search",
      shouldAutoDark: true,
      shouldUpdateMenu: true,
      stem: "https://photos.google.com",
    });
  });

  describe("Handles an invalid url gracefully", () => {
    const invalidUrl = "htp//:thing.test";
    testUrl(invalidUrl, {
      domain: invalidUrl,
      full: invalidUrl,
      normal: invalidUrl,
      shouldAutoDark: true,
      shouldUpdateMenu: true,
      stem: invalidUrl,
    });
  });

  describe("Handles garbage input gracefully", () => {
    const garbageUrl = "garbageString+5";
    testUrl(garbageUrl, {
      domain: garbageUrl,
      full: garbageUrl,
      normal: garbageUrl,
      shouldAutoDark: true,
      shouldUpdateMenu: true,
      stem: garbageUrl,
    });
  });

  describe("Handles file urls correctly", () => {
    const fileUrl = "file:///Users/user/Path/pdffile.pdf#thing";
    testUrl(fileUrl, {
      domain: "/Users/user/Path/pdffile.pdf",
      full: fileUrl,
      normal: fileUrl.split("#")[0],
      // Because it is a pdf
      shouldAutoDark: false,
      shouldUpdateMenu: true,
      stem: "file://",
    });
  });

  describe("Handles empty urls correctly", () => {
    testUrl("", {
      domain: "",
      full: "",
      normal: "",
      shouldAutoDark: true,
      shouldUpdateMenu: true,
      stem: "",
    });
  });

  describe("Handles chrome urls correctly", () => {
    testUrl("chrome://location", {
      domain: "chrome://",
      full: "chrome://",
      normal: "chrome://",
      shouldAutoDark: false,
      shouldUpdateMenu: false,
      stem: "chrome://",
    });
  });

  describe("Handles undefined input gracefully", () => {
    testUrl(undefined, {
      domain: "about:blank",
      full: "about:blank",
      normal: "about:blank",
      shouldAutoDark: true,
      shouldUpdateMenu: false,
      stem: "about:blank",
    });
  });

  describe("Handles complex urls correctly", () => {
    // tslint:disable:max-line-length
    const complexUrl =
      "https://www.google.com/maps/place/Mountain+View,+CA/@37.4133865,-122.1162863,13z/data=!3m1!4b1!4m5!3m4!1s0x808fb7495bec0189:0x7c17d44a466baf9b!8m2!3d37.3860517!4d-122.0838511";
    testUrl(complexUrl, {
      domain: "google.com",
      full: complexUrl,
      normal: "https://www.google.com/maps/place",
      shouldAutoDark: true,
      shouldUpdateMenu: true,
      stem: "https://www.google.com",
    });
  });
});

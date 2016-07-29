class SettingId {
    // Standardize naming of Fields that are accessed from multiple places
    //
    // Access Field Id:
    // SettingId.CurrentUrl.Dark -> "CurrentUrlDark"
    //
    // Access Field Type:
    // SettingId.Type.Hue -> "boolean"
    //
    // Access Id:
    // SettingId.Id.Dark -> "Dark"
    //
    // Access Group
    // SettingId.Group.CurrentUrl -> "CurrentUrl"

    private static Fields = {
        Id: {
            Name: "Id",
            Type: "string"
        },
        Dark: {
            Name: "Dark",
            Type: "boolean",
            Default: true
        },
        Hue: {
            Name: "Hue",
            Type: "boolean",
            Default: true
        },
        Contrast: {
            Name: "Contrast",
            Type: "number",
            Default: 85,
            Min: 50,
            Max: 150,
            Step: 1
        },
        Clear: {
            Name: "Clear",
            Type: "boolean"
        },
        AutoDark: {
            Name: "AutoDark",
            Type: "string",
            Default: true
        },
        ShowNotifications: {
            Name: "ShowNotifications",
            Type: "boolean",
            Default: true
        },
        // Global Setting, should all sites be logged to reduce the number
        // of times auto dark is run
        LogAutoDark: {
            Name: "LogAutoDark",
            Type: "boolean",
            Default: false
        },
        // Url Setting, has auto dark been run on this site
        CheckedAutoDark: {
            Name: "CheckedAutoDark",
            Type: "boolean",
            Default: false
        },
        // Stem Setting, if a number of sites have been checked, then the
        // whole site "should" be dark and no more checking will be done
        ShouldAutoDark: {
            Name: "ShouldAutoDark",
            Type: "boolean",
            Default: false
        },
        Shortcut: {
            Name: "Shortcut",
            Type: "string"
        },
        Url: {
            Name: "Url",
            Type: "string"
        },
        UrlStem: {
            Name: "UrlStem",
            Type: "string"
        }
    };

    // Group Groups
    private static CurrentUrlGroup = "CurrentUrl";
    private static StemUrlGroup = "StemUrl";
    private static GlobalGroup = "Global";

    static CurrentUrl = {
        Id: SettingId.CurrentUrlGroup,
        Dark: SettingId.CurrentUrlGroup + SettingId.Fields.Dark.Name,
        Hue: SettingId.CurrentUrlGroup + SettingId.Fields.Hue.Name,
        Contrast: SettingId.CurrentUrlGroup + SettingId.Fields.Contrast.Name,
        Clear: SettingId.CurrentUrlGroup + SettingId.Fields.Clear.Name,
        CheckedAutoDark: SettingId.CurrentUrlGroup + SettingId.Fields.CheckedAutoDark.Name,
    };

    static StemUrl = {
        Id: SettingId.StemUrlGroup,
        Dark: SettingId.StemUrlGroup + SettingId.Fields.Dark.Name,
        Hue: SettingId.StemUrlGroup + SettingId.Fields.Hue.Name,
        Contrast: SettingId.StemUrlGroup + SettingId.Fields.Contrast.Name,
        Clear: SettingId.StemUrlGroup + SettingId.Fields.Clear.Name,
        ShouldAutoDark: SettingId.StemUrlGroup + SettingId.Fields.ShouldAutoDark.Name,
    };

    static Global = {
        Id: SettingId.GlobalGroup,
        Dark: SettingId.GlobalGroup + SettingId.Fields.Dark.Name,
        Hue: SettingId.GlobalGroup + SettingId.Fields.Hue.Name,
        Contrast: SettingId.GlobalGroup + SettingId.Fields.Contrast.Name,
        Clear: SettingId.GlobalGroup + SettingId.Fields.Clear.Name,
        AutoDark: SettingId.GlobalGroup + SettingId.Fields.AutoDark.Name,
        Shortcut: SettingId.GlobalGroup + SettingId.Fields.Shortcut.Name,
        ShowNotifications: SettingId.GlobalGroup + SettingId.Fields.ShowNotifications.Name,
        LogAutoDark: SettingId.GlobalGroup + SettingId.Fields.LogAutoDark.Name,
    };

    static Group = {
        CurrentUrl: SettingId.CurrentUrlGroup,
        StemUrl: SettingId.StemUrlGroup,
        Global: SettingId.GlobalGroup,
        GroupTitle: "Group",
        Init: "Init",
    };

    static Field = {
        Id: SettingId.Fields.Id.Name,
        Dark: SettingId.Fields.Dark.Name,
        Hue: SettingId.Fields.Hue.Name,
        Contrast: SettingId.Fields.Contrast.Name,
        Clear: SettingId.Fields.Clear.Name,
        AutoDark: SettingId.Fields.AutoDark.Name,
        Shortcut: SettingId.Fields.Shortcut.Name,
        LogAutoDark: SettingId.Fields.LogAutoDark.Name,
        CheckedAutoDark: SettingId.Fields.CheckedAutoDark.Name,
        ShouldAutoDark: SettingId.Fields.ShouldAutoDark.Name,
        ShowNotifications: SettingId.Fields.ShowNotifications.Name,
        Init: "Init",
        Url: SettingId.Fields.Url.Name,
        UrlStem: SettingId.Fields.UrlStem.Name,
    };

    static Type = {
        Id: SettingId.Fields.Id.Type,
        Dark: SettingId.Fields.Dark.Type,
        Hue: SettingId.Fields.Hue.Type,
        Contrast: SettingId.Fields.Contrast.Type,
        Clear: SettingId.Fields.Clear.Type,
        AutoDark: SettingId.Fields.AutoDark.Type,
        Shortcut: SettingId.Fields.Shortcut.Type,
        LogAutoDark: SettingId.Fields.LogAutoDark.Type,
        ShowNotifications: SettingId.Fields.ShowNotifications.Type,
        CheckedAutoDark: SettingId.Fields.CheckedAutoDark.Type,
        ShouldAutoDark: SettingId.Fields.ShouldAutoDark.Type,
    };

    static Default = {
        Dark: SettingId.Fields.Dark.Default,
        Hue: SettingId.Fields.Hue.Default,
        Contrast: SettingId.Fields.Contrast.Default,
        AutoDark: SettingId.Fields.AutoDark.Default,
        ContrastMin: SettingId.Fields.Contrast.Min,
        ContrastMax: SettingId.Fields.Contrast.Max,
        ContrastStep: SettingId.Fields.Contrast.Step,
        ShowNotifications: SettingId.Fields.ShowNotifications.Default,
        LogAutoDark: SettingId.Fields.LogAutoDark.Default,
        CheckedAutoDark: SettingId.Fields.CheckedAutoDark.Default,
        ShouldAutoDark: SettingId.Fields.ShouldAutoDark.Default,
    }
}

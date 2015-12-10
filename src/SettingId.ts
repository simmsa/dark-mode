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
            Type: "boolean"
        },
        Hue: {
            Name: "Hue",
            Type: "boolean"
        },
        Contrast: {
            Name: "Contrast",
            Type: "number"
        },
        Clear: {
            Name: "Clear",
            Type: "boolean"
        },
        AutoDark: {
            Name: "AutoDark",
            Type: "string"
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
    };

    static StemUrl = {
        Id: SettingId.StemUrlGroup,
        Dark: SettingId.StemUrlGroup + SettingId.Fields.Dark.Name,
        Hue: SettingId.StemUrlGroup + SettingId.Fields.Hue.Name,
        Contrast: SettingId.StemUrlGroup + SettingId.Fields.Contrast.Name,
        Clear: SettingId.StemUrlGroup + SettingId.Fields.Clear.Name,
    };

    static Global = {
        Id: SettingId.GlobalGroup,
        Dark: SettingId.GlobalGroup + SettingId.Fields.Dark.Name,
        Hue: SettingId.GlobalGroup + SettingId.Fields.Hue.Name,
        Contrast: SettingId.GlobalGroup + SettingId.Fields.Contrast.Name,
        Clear: SettingId.GlobalGroup + SettingId.Fields.Clear.Name,
        AutoDark: SettingId.GlobalGroup + SettingId.Fields.AutoDark.Name,
        Shortcut: SettingId.GlobalGroup + SettingId.Fields.Shortcut.Name,
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
    };

}

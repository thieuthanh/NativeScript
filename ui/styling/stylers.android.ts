﻿import types = require("utils/types");
import view = require("ui/core/view");
import style = require("./style");
import definition = require("ui/styling");
import stylersCommon = require("./stylers-common");
import enums = require("ui/enums");
import utils = require("utils/utils");
import styleModule = require("./style");
import font = require("ui/styling/font");
import background = require("ui/styling/background");
import tabView = require("ui/tab-view");
var btn;

global.moduleMerge(stylersCommon, exports);

var SDK = android.os.Build.VERSION.SDK_INT;

var ignorePropertyHandler = new stylersCommon.StylePropertyChangedHandler(
    (view, val) => {
        // empty
    },
    (view, val) => {
        // empty
    });

var _defaultBackgrounds = new Map<string, android.graphics.drawable.Drawable>();

function onBackgroundOrBorderPropertyChanged(v: view.View) {
    if (!btn) {
        btn = require("ui/button");
    }

    var nativeView = <android.view.View>v._nativeView;
    if (!nativeView) {
        return;
    }

    var backgroundValue = <background.Background>v.style._getValue(styleModule.backgroundInternalProperty);
    var borderWidth = v.borderWidth;
    if (v.borderWidth !== 0 || v.borderRadius !== 0 || !backgroundValue.isEmpty()) {

        var bkg = <background.ad.BorderDrawable>nativeView.getBackground();
        if (!(bkg instanceof background.ad.BorderDrawable)) {
            bkg = new background.ad.BorderDrawable();
            let viewClass = types.getClass(v);
            if (!(v instanceof btn.Button) && !_defaultBackgrounds.has(viewClass)) {
                _defaultBackgrounds.set(viewClass, nativeView.getBackground());
            }

            nativeView.setBackground(bkg);
        }

        bkg.borderWidth = v.borderWidth;
        bkg.cornerRadius = v.borderRadius;
        bkg.borderColor = v.borderColor ? v.borderColor.android : android.graphics.Color.TRANSPARENT;
        bkg.background = backgroundValue;

        if (SDK < 18) {
            // Switch to software because of unsupported canvas methods if hardware acceleration is on:
            // http://developer.android.com/guide/topics/graphics/hardware-accel.html
            nativeView.setLayerType(android.view.View.LAYER_TYPE_SOFTWARE, null);
        }
    }
    else {
        // reset the value with the default native value
        if (v instanceof btn.Button) {
            var nativeButton = new android.widget.Button(nativeView.getContext());
            nativeView.setBackground(nativeButton.getBackground());
        }
        else {
            let viewClass = types.getClass(v);
            if (_defaultBackgrounds.has(viewClass)) {
                nativeView.setBackground(_defaultBackgrounds.get(viewClass));
            }
        }

        if (SDK < 18) {
            // Reset layer type to hardware
            nativeView.setLayerType(android.view.View.LAYER_TYPE_HARDWARE, null);
        }
    }

    var density = utils.layout.getDisplayDensity();
    nativeView.setPadding(
        Math.round((borderWidth + v.style.paddingLeft) * density),
        Math.round((borderWidth + v.style.paddingTop) * density),
        Math.round((borderWidth + v.style.paddingRight) * density),
        Math.round((borderWidth + v.style.paddingBottom) * density)
    );
}

export class DefaultStyler implements definition.stylers.Styler {
    //Background and borders methods
    private static setBackgroundBorderProperty(view: view.View, newValue: any, defaultValue: any) {
        onBackgroundOrBorderPropertyChanged(view);
    }

    private static resetBackgroundBorderProperty(view: view.View, nativeValue: any) {
        onBackgroundOrBorderPropertyChanged(view);
    }

    //Visibility methods
    private static setVisibilityProperty(view: view.View, newValue: any) {
        var androidValue = (newValue === enums.Visibility.visible) ? android.view.View.VISIBLE : android.view.View.GONE;
        (<android.view.View>view._nativeView).setVisibility(androidValue);
    }

    private static resetVisibilityProperty(view: view.View, nativeValue: any) {
        (<android.view.View>view._nativeView).setVisibility(android.view.View.VISIBLE);
    }

    //Opacity methods
    private static setOpacityProperty(view: view.View, newValue: any) {
        (<android.view.View>view._nativeView).setAlpha(float(newValue));
    }

    private static resetOpacityProperty(view: view.View, nativeValue: any) {
        (<android.view.View>view._nativeView).setAlpha(float(1.0));
    }

    //minWidth methods
    private static setMinWidthProperty(view: view.View, newValue: any) {
        (<android.view.View>view._nativeView).setMinimumWidth(Math.round(newValue * utils.layout.getDisplayDensity()));
    }

    private static resetMinWidthProperty(view: view.View, nativeValue: any) {
        (<android.view.View>view._nativeView).setMinimumWidth(0);
    }

    //minHeight methods
    private static setMinHeightProperty(view: view.View, newValue: any) {
        (<android.view.View>view._nativeView).setMinimumHeight(Math.round(newValue * utils.layout.getDisplayDensity()));
    }

    private static resetMinHeightProperty(view: view.View, nativeValue: any) {
        (<android.view.View>view._nativeView).setMinimumHeight(0);
    }

    private static getNativeLayoutParams(nativeView: android.view.View): org.nativescript.widgets.CommonLayoutParams {
        var lp = <org.nativescript.widgets.CommonLayoutParams>nativeView.getLayoutParams();
        if (!(lp instanceof org.nativescript.widgets.CommonLayoutParams)) {
            lp = new org.nativescript.widgets.CommonLayoutParams();
        }

        return lp;
    }

    private static setNativeLayoutParamsProperty(view: view.View, params: style.CommonLayoutParams): void {
        var nativeView: android.view.View = view._nativeView;
        var lp = DefaultStyler.getNativeLayoutParams(nativeView);

        lp.leftMargin = Math.round(params.leftMargin * utils.layout.getDisplayDensity());
        lp.topMargin = Math.round(params.topMargin * utils.layout.getDisplayDensity());
        lp.rightMargin = Math.round(params.rightMargin * utils.layout.getDisplayDensity());
        lp.bottomMargin = Math.round(params.bottomMargin * utils.layout.getDisplayDensity());

        var width = params.width * utils.layout.getDisplayDensity();
        var height = params.height * utils.layout.getDisplayDensity();
        
        // If width is not specified set it as WRAP_CONTENT
        if (width < 0) {
            width = -2;
        }

        // If height is not specified set it as WRAP_CONTENT
        if (height < 0) {
            height = -2;
        }

        var gravity = 0;
        switch (params.horizontalAlignment) {
            case enums.HorizontalAlignment.left:
               	gravity |= android.view.Gravity.LEFT;
                break;

            case enums.HorizontalAlignment.center:
                gravity |= android.view.Gravity.CENTER_HORIZONTAL;
                break;

            case enums.HorizontalAlignment.right:
                gravity |= android.view.Gravity.RIGHT;
                break;

            case enums.HorizontalAlignment.stretch:
                gravity |= android.view.Gravity.FILL_HORIZONTAL;
                // If width is not specified set it as MATCH_PARENT
                if (width < 0) {
                    width = -1;
                }
                break;

            default:
                throw new Error("Invalid horizontalAlignment value: " + params.horizontalAlignment);
        }

        switch (params.verticalAlignment) {
            case enums.VerticalAlignment.top:
                gravity |= android.view.Gravity.TOP;
                break;

            case enums.VerticalAlignment.center || enums.VerticalAlignment.middle:
                gravity |= android.view.Gravity.CENTER_VERTICAL;
                break;

            case enums.VerticalAlignment.bottom:
                gravity |= android.view.Gravity.BOTTOM;
                break;

            case enums.VerticalAlignment.stretch:
                gravity |= android.view.Gravity.FILL_VERTICAL;
                // If height is not specified set it as MATCH_PARENT
                if (height < 0) {
                    height = -1;
                }
                break;

            default:
                throw new Error("Invalid verticalAlignment value: " + params.verticalAlignment);
        }

        lp.gravity = gravity;
        lp.width = Math.round(width);
        lp.height = Math.round(height);

        nativeView.setLayoutParams(lp);
    }

    private static resetNativeLayoutParamsProperty(view: view.View, nativeValue: any): void {
        var nativeView: android.view.View = view._nativeView;
        var lp = DefaultStyler.getNativeLayoutParams(nativeView);

        lp.width = -1;
        lp.height = -1;
        lp.leftMargin = 0;
        lp.topMargin = 0;
        lp.rightMargin = 0;
        lp.bottomMargin = 0;
        lp.gravity = android.view.Gravity.FILL_HORIZONTAL | android.view.Gravity.FILL_VERTICAL;
        nativeView.setLayoutParams(lp);
    }

    private static setPaddingProperty(view: view.View, newValue: style.Thickness) {
        var density = utils.layout.getDisplayDensity();
        var left = Math.round((newValue.left + view.borderWidth) * density);
        var top = Math.round((newValue.top + view.borderWidth) * density);
        var right = Math.round((newValue.right + view.borderWidth) * density);
        var bottom = Math.round((newValue.bottom + view.borderWidth) * density);
        (<android.view.View>view._nativeView).setPadding(left, top, right, bottom);
    }

    private static resetPaddingProperty(view: view.View, nativeValue: style.Thickness) {
        var density = utils.layout.getDisplayDensity();
        var left = Math.round((nativeValue.left + view.borderWidth) * density);
        var top = Math.round((nativeValue.top + view.borderWidth) * density);
        var right = Math.round((nativeValue.right + view.borderWidth) * density);
        var bottom = Math.round((nativeValue.bottom + view.borderWidth) * density);
        (<android.view.View>view._nativeView).setPadding(left, top, right, bottom);
    }

    public static registerHandlers() {
        style.registerHandler(style.visibilityProperty, new stylersCommon.StylePropertyChangedHandler(
            DefaultStyler.setVisibilityProperty,
            DefaultStyler.resetVisibilityProperty));

        style.registerHandler(style.opacityProperty, new stylersCommon.StylePropertyChangedHandler(
            DefaultStyler.setOpacityProperty,
            DefaultStyler.resetOpacityProperty));

        style.registerHandler(style.minWidthProperty, new stylersCommon.StylePropertyChangedHandler(
            DefaultStyler.setMinWidthProperty,
            DefaultStyler.resetMinWidthProperty));

        style.registerHandler(style.minHeightProperty, new stylersCommon.StylePropertyChangedHandler(
            DefaultStyler.setMinHeightProperty,
            DefaultStyler.resetMinHeightProperty))

        // Use the same handler for all background/border properties
        // Note: There is no default value getter - the default value is handled in onBackgroundOrBorderPropertyChanged
        var borderHandler = new stylersCommon.StylePropertyChangedHandler(
            DefaultStyler.setBackgroundBorderProperty,
            DefaultStyler.resetBackgroundBorderProperty);

        style.registerHandler(style.backgroundInternalProperty, borderHandler);
        style.registerHandler(style.borderWidthProperty, borderHandler);
        style.registerHandler(style.borderColorProperty, borderHandler);
        style.registerHandler(style.borderRadiusProperty, borderHandler);

        style.registerHandler(style.nativeLayoutParamsProperty, new stylersCommon.StylePropertyChangedHandler(
            DefaultStyler.setNativeLayoutParamsProperty,
            DefaultStyler.resetNativeLayoutParamsProperty));

        style.registerHandler(style.nativePaddingsProperty, new stylersCommon.StylePropertyChangedHandler(
            DefaultStyler.setPaddingProperty,
            DefaultStyler.resetPaddingProperty), "TextBase");

        style.registerHandler(style.nativePaddingsProperty, new stylersCommon.StylePropertyChangedHandler(
            DefaultStyler.setPaddingProperty,
            DefaultStyler.resetPaddingProperty), "Button");

        style.registerHandler(style.nativePaddingsProperty, new stylersCommon.StylePropertyChangedHandler(
            DefaultStyler.setPaddingProperty,
            DefaultStyler.resetPaddingProperty), "LayoutBase");
    }
}

export class ImageStyler implements definition.stylers.Styler {
    // Corner radius
    private static setBorderRadiusProperty(view: view.View, newValue: any, defaultValue: any) {
        if (!view._nativeView) {
            return;
        }
        var val = Math.round(newValue * utils.layout.getDisplayDensity());
        (<org.nativescript.widgets.ImageView>view._nativeView).setCornerRadius(val);
        onBackgroundOrBorderPropertyChanged(view);
    }

    private static resetBorderRadiusProperty(view: view.View, nativeValue: any) {
        if (!view._nativeView) {
            return;
        }
        (<org.nativescript.widgets.ImageView>view._nativeView).setCornerRadius(0);
        onBackgroundOrBorderPropertyChanged(view);
    }

    // Border width
    private static setBorderWidthProperty(view: view.View, newValue: any, defaultValue: any) {
        if (!view._nativeView) {
            return;
        }

        var val = Math.round(newValue * utils.layout.getDisplayDensity());
        (<org.nativescript.widgets.ImageView>view._nativeView).setBorderWidth(val);
        onBackgroundOrBorderPropertyChanged(view);
    }

    private static resetBorderWidthProperty(view: view.View, nativeValue: any) {
        if (!view._nativeView) {
            return;
        }
        (<org.nativescript.widgets.ImageView>view._nativeView).setBorderWidth(0);
        onBackgroundOrBorderPropertyChanged(view);
    }

    //Opacity methods
    private static setOpacityProperty(view: view.View, newValue: any) {
        ImageStyler._setOpacity(view, newValue);
    }

    private static resetOpacityProperty(view: view.View, nativeValue: any) {
        ImageStyler._setOpacity(view, 1.0);
    }

    private static _setOpacity(view: view.View, value: any) {
        let opacity = float(value);
        let nativeView = <android.view.View>view._nativeView;
        nativeView.setAlpha(opacity);
        let background = nativeView.getBackground();
        if (background) {
            background.setAlpha(opacity);
        }
    }

    public static registerHandlers() {
        // Use the same handler for all background/border properties
        // Note: There is no default value getter - the default value is handled in onBackgroundOrBorderPropertyChanged

        style.registerHandler(style.borderRadiusProperty, new stylersCommon.StylePropertyChangedHandler(
            ImageStyler.setBorderRadiusProperty,
            ImageStyler.resetBorderRadiusProperty), "Image");

        style.registerHandler(style.borderWidthProperty, new stylersCommon.StylePropertyChangedHandler(
            ImageStyler.setBorderWidthProperty,
            ImageStyler.resetBorderWidthProperty), "Image");

        style.registerHandler(style.opacityProperty, new stylersCommon.StylePropertyChangedHandler(
            ImageStyler.setOpacityProperty,
            ImageStyler.resetOpacityProperty), "Image");
    }
}

export class TextViewStyler implements definition.stylers.Styler {
    // color
    private static setColorProperty(view: view.View, newValue: any) {
        (<android.widget.TextView>view._nativeView).setTextColor(newValue);
    }

    private static resetColorProperty(view: view.View, nativeValue: any) {
        (<android.widget.TextView>view._nativeView).setTextColor(nativeValue);
    }

    private static getNativeColorValue(view: view.View): any {
        return (<android.widget.TextView>view._nativeView).getTextColors().getDefaultColor();
    }

    // font
    private static setFontInternalProperty(view: view.View, newValue: any, nativeValue: any) {
        var tv = <android.widget.TextView>view._nativeView;
        var fontValue = <font.Font>newValue;

        var typeface = fontValue.getAndroidTypeface();
        if (typeface) {
            tv.setTypeface(typeface);
        }
        else {
            tv.setTypeface(nativeValue.typeface);
        }

        if (fontValue.fontSize) {
            tv.setTextSize(fontValue.fontSize);
        }
        else {
            tv.setTextSize(android.util.TypedValue.COMPLEX_UNIT_PX, nativeValue.size);
        }
    }

    private static resetFontInternalProperty(view: view.View, nativeValue: any) {
        var tv: android.widget.TextView = <android.widget.TextView>view._nativeView;
        tv.setTypeface(nativeValue.typeface);
        tv.setTextSize(android.util.TypedValue.COMPLEX_UNIT_PX, nativeValue.size);
    }

    private static getNativeFontInternalValue(view: view.View): any {
        var tv: android.widget.TextView = <android.widget.TextView>view._nativeView;
        return {
            typeface: tv.getTypeface(),
            size: tv.getTextSize()
        };
    }

    // text-align
    private static setTextAlignmentProperty(view: view.View, newValue: any) {
        var verticalGravity = view._nativeView.getGravity() & android.view.Gravity.VERTICAL_GRAVITY_MASK;
        switch (newValue) {
            case enums.TextAlignment.left:
                view._nativeView.setGravity(android.view.Gravity.LEFT | verticalGravity);
                break;
            case enums.TextAlignment.center:
                view._nativeView.setGravity(android.view.Gravity.CENTER_HORIZONTAL | verticalGravity);
                break;
            case enums.TextAlignment.right:
                view._nativeView.setGravity(android.view.Gravity.RIGHT | verticalGravity);
                break;
            default:
                break;
        }
    }

    private static resetTextAlignmentProperty(view: view.View, nativeValue: any) {
        view._nativeView.setGravity(nativeValue);
    }

    private static getNativeTextAlignmentValue(view: view.View): any {
        return view._nativeView.getGravity();
    }

    // text-decoration
    private static setTextDecorationProperty(view: view.View, newValue: any) {
        setTextDecoration(view._nativeView, newValue);
    }

    private static resetTextDecorationProperty(view: view.View, nativeValue: any) {
        setTextDecoration(view._nativeView, enums.TextDecoration.none);
    }

    // text-transform
    private static setTextTransformProperty(view: view.View, newValue: any) {
        setTextTransform(view._nativeView, newValue);
    }

    private static resetTextTransformProperty(view: view.View, nativeValue: any) {
        setTextTransform(view._nativeView, enums.TextTransform.none);
    }

    // white-space
    private static setWhiteSpaceProperty(view: view.View, newValue: any) {
        setWhiteSpace(view._nativeView, newValue);
    }

    private static resetWhiteSpaceProperty(view: view.View, nativeValue: any) {
        setWhiteSpace(view._nativeView, enums.WhiteSpace.normal);
    }

    public static registerHandlers() {
        style.registerHandler(style.colorProperty, new stylersCommon.StylePropertyChangedHandler(
            TextViewStyler.setColorProperty,
            TextViewStyler.resetColorProperty,
            TextViewStyler.getNativeColorValue), "TextBase");

        style.registerHandler(style.fontInternalProperty, new stylersCommon.StylePropertyChangedHandler(
            TextViewStyler.setFontInternalProperty,
            TextViewStyler.resetFontInternalProperty,
            TextViewStyler.getNativeFontInternalValue), "TextBase");

        style.registerHandler(style.textAlignmentProperty, new stylersCommon.StylePropertyChangedHandler(
            TextViewStyler.setTextAlignmentProperty,
            TextViewStyler.resetTextAlignmentProperty,
            TextViewStyler.getNativeTextAlignmentValue), "TextBase");

        style.registerHandler(style.textDecorationProperty, new stylersCommon.StylePropertyChangedHandler(
            TextViewStyler.setTextDecorationProperty,
            TextViewStyler.resetTextDecorationProperty), "TextBase");

        style.registerHandler(style.textTransformProperty, new stylersCommon.StylePropertyChangedHandler(
            TextViewStyler.setTextTransformProperty,
            TextViewStyler.resetTextTransformProperty), "TextBase");

        style.registerHandler(style.whiteSpaceProperty, new stylersCommon.StylePropertyChangedHandler(
            TextViewStyler.setWhiteSpaceProperty,
            TextViewStyler.resetWhiteSpaceProperty), "TextBase");

        // Register the same stylers for Button.
        // It also derives from TextView but is not under TextBase in our View hierarchy.
        style.registerHandler(style.colorProperty, new stylersCommon.StylePropertyChangedHandler(
            TextViewStyler.setColorProperty,
            TextViewStyler.resetColorProperty,
            TextViewStyler.getNativeColorValue), "Button");

        style.registerHandler(style.fontInternalProperty, new stylersCommon.StylePropertyChangedHandler(
            TextViewStyler.setFontInternalProperty,
            TextViewStyler.resetFontInternalProperty,
            TextViewStyler.getNativeFontInternalValue), "Button");

        style.registerHandler(style.textAlignmentProperty, new stylersCommon.StylePropertyChangedHandler(
            TextViewStyler.setTextAlignmentProperty,
            TextViewStyler.resetTextAlignmentProperty,
            TextViewStyler.getNativeTextAlignmentValue), "Button");

        style.registerHandler(style.textDecorationProperty, new stylersCommon.StylePropertyChangedHandler(
            TextViewStyler.setTextDecorationProperty,
            TextViewStyler.resetTextDecorationProperty), "Button");

        style.registerHandler(style.textTransformProperty, new stylersCommon.StylePropertyChangedHandler(
            TextViewStyler.setTextTransformProperty,
            TextViewStyler.resetTextTransformProperty), "Button");

        style.registerHandler(style.whiteSpaceProperty, new stylersCommon.StylePropertyChangedHandler(
            TextViewStyler.setWhiteSpaceProperty,
            TextViewStyler.resetWhiteSpaceProperty), "Button");
    }
}

function setTextDecoration(view: android.widget.TextView, value: string) {
    var flags = 0;

    var values = (value + "").split(" ");

    if (values.indexOf(enums.TextDecoration.underline) !== -1) {
        flags = flags | android.graphics.Paint.UNDERLINE_TEXT_FLAG;
    }

    if (values.indexOf(enums.TextDecoration.lineThrough) !== -1) {
        flags = flags | android.graphics.Paint.STRIKE_THRU_TEXT_FLAG;
    }

    if (values.indexOf(enums.TextDecoration.none) === -1) {
        view.setPaintFlags(flags);
    } else {
        view.setPaintFlags(0);
    }
}

function setTextTransform(view: android.widget.TextView, value: string) {
    let str = view.getText() + "";
    let result: string;

    switch (value) {
        case enums.TextTransform.none:
        default:
            result = view["originalString"] || str;
            if (view["transformationMethod"]) {
                view.setTransformationMethod(view["transformationMethod"]);
            }
            break;
        case enums.TextTransform.uppercase:
            view.setTransformationMethod(null);
            result = str.toUpperCase();
            break;
        case enums.TextTransform.lowercase:
            view.setTransformationMethod(null);
            result = str.toLowerCase();
            break;
        case enums.TextTransform.capitalize:
            view.setTransformationMethod(null);
            result = getCapitalizedString(str);
            break;
    }

    if (!view["originalString"]) {
        view["originalString"] = str;
        view["transformationMethod"] = view.getTransformationMethod();
    }

    view.setText(result);
}

function getCapitalizedString(str: string): string {
    var words = str.split(" ");
    var newWords = [];
    for (let i = 0; i < words.length; i++) {
        let word = words[i];
        newWords.push(word.substr(0, 1).toUpperCase() + word.substring(1));
    }

    return newWords.join(" ");
}

function setWhiteSpace(view: android.widget.TextView, value: string) {
    view.setSingleLine(value === enums.WhiteSpace.nowrap);
    view.setEllipsize(value === enums.WhiteSpace.nowrap ? android.text.TextUtils.TruncateAt.END : null);
}

export class ActivityIndicatorStyler implements definition.stylers.Styler {
    private static setColorProperty(view: view.View, newValue: any) {
        var bar = <android.widget.ProgressBar>view._nativeView;
        bar.getIndeterminateDrawable().setColorFilter(newValue, android.graphics.PorterDuff.Mode.SRC_IN);
    }

    private static resetColorProperty(view: view.View, nativeValue: number) {
        var bar = <android.widget.ProgressBar>view._nativeView;
        bar.getIndeterminateDrawable().clearColorFilter();
    }

    //Visibility methods
    public static setActivityIndicatorVisibilityProperty(view: view.View, newValue: any) {
        ActivityIndicatorStyler.setIndicatorVisibility((<any>view).busy, newValue, view._nativeView);
    }

    public static resetActivityIndicatorVisibilityProperty(view: view.View, nativeValue: any) {
        ActivityIndicatorStyler.setIndicatorVisibility((<any>view).busy, enums.Visibility.visible, view._nativeView);
    }

    public static setIndicatorVisibility(isBusy: boolean, visibility: string, nativeView: android.view.View) {
        if (visibility === enums.Visibility.collapsed || visibility === enums.Visibility.collapse) {
            nativeView.setVisibility(android.view.View.GONE);
        }
        else {
            nativeView.setVisibility(isBusy ? android.view.View.VISIBLE : android.view.View.INVISIBLE);
        }
    }

    public static registerHandlers() {
        style.registerHandler(style.colorProperty, new stylersCommon.StylePropertyChangedHandler(
            ActivityIndicatorStyler.setColorProperty,
            ActivityIndicatorStyler.resetColorProperty), "ActivityIndicator");

        style.registerHandler(style.visibilityProperty, new stylersCommon.StylePropertyChangedHandler(
            ActivityIndicatorStyler.setActivityIndicatorVisibilityProperty,
            ActivityIndicatorStyler.resetActivityIndicatorVisibilityProperty), "ActivityIndicator");
    }
}

export class SegmentedBarStyler implements definition.stylers.Styler {
    //Text color methods
    private static setColorProperty(view: view.View, newValue: any) {
        var tabHost = <android.widget.TabHost>view._nativeView;

        for (var tabIndex = 0; tabIndex < tabHost.getTabWidget().getTabCount(); tabIndex++) {
            var tab = <android.view.ViewGroup>tabHost.getTabWidget().getChildTabViewAt(tabIndex);
            var t = <android.widget.TextView>tab.getChildAt(1);
            t.setTextColor(newValue);
        }
    }

    private static resetColorProperty(view: view.View, nativeValue: number) {
        var tabHost = <android.widget.TabHost>view._nativeView;

        for (var tabIndex = 0; tabIndex < tabHost.getTabWidget().getTabCount(); tabIndex++) {
            var tab = <android.view.ViewGroup>tabHost.getTabWidget().getChildTabViewAt(tabIndex);
            var t = <android.widget.TextView>tab.getChildAt(1);
            t.setTextColor(nativeValue);
        }
    }

    private static getColorProperty(view: view.View): number {
        var tabHost = <android.widget.TabHost>view._nativeView;
        var textView = new android.widget.TextView(tabHost.getContext());
        return textView.getCurrentTextColor();
    }

    //Font methods
    private static setFontInternalProperty(view: view.View, newValue: any, nativeValue: any) {
        let tabHost = <android.widget.TabHost>view._nativeView;
        let fontValue = <font.Font>newValue;

        for (let tabIndex = 0; tabIndex < tabHost.getTabWidget().getTabCount(); tabIndex++) {
            let tab = <android.view.ViewGroup>tabHost.getTabWidget().getChildTabViewAt(tabIndex);
            let t = <android.widget.TextView>tab.getChildAt(1);
            let typeface = fontValue.getAndroidTypeface();
            if (typeface) {
                t.setTypeface(typeface);
            }
            else {
                t.setTypeface(nativeValue.typeface);
            }

            if (fontValue.fontSize) {
                t.setTextSize(fontValue.fontSize);
            }
            else {
                t.setTextSize(android.util.TypedValue.COMPLEX_UNIT_PX, nativeValue.size);
            }
        }
    }

    private static resetFontInternalProperty(view: view.View, nativeValue: any) {
        let tabHost = <android.widget.TabHost>view._nativeView;
        for (let tabIndex = 0; tabIndex < tabHost.getTabWidget().getTabCount(); tabIndex++) {
            let tab = <android.view.ViewGroup>tabHost.getTabWidget().getChildTabViewAt(tabIndex);
            let t = <android.widget.TextView>tab.getChildAt(1);
            t.setTypeface(nativeValue.typeface);
            t.setTextSize(nativeValue.size);
        }
    }

    private static getFontInternalProperty(view: view.View): any {
        let tabHost = <android.widget.TabHost>view._nativeView;
        var textView = new android.widget.TextView(tabHost.getContext());
        return {
            typeface: textView.getTypeface(),
            size: textView.getTextSize()
        };
    }

    public static registerHandlers() {
        style.registerHandler(style.colorProperty, new stylersCommon.StylePropertyChangedHandler(
            SegmentedBarStyler.setColorProperty,
            SegmentedBarStyler.resetColorProperty,
            SegmentedBarStyler.getColorProperty), "SegmentedBar");
        style.registerHandler(style.fontInternalProperty, new stylersCommon.StylePropertyChangedHandler(
            SegmentedBarStyler.setFontInternalProperty,
            SegmentedBarStyler.resetFontInternalProperty,
            SegmentedBarStyler.getFontInternalProperty), "SegmentedBar");
    }
}

export class ProgressStyler implements definition.stylers.Styler {
    private static setColorProperty(view: view.View, newValue: any) {
        var bar = <android.widget.ProgressBar>view._nativeView;
        bar.getProgressDrawable().setColorFilter(newValue, android.graphics.PorterDuff.Mode.SRC_IN);
    }

    private static resetColorProperty(view: view.View, nativeValue: number) {
        var bar = <android.widget.ProgressBar>view._nativeView;
        bar.getProgressDrawable().clearColorFilter();
    }

    private static setBackgroundAndBorderProperty(view: view.View, newValue: any) {
        var bar = <android.widget.ProgressBar>view._nativeView;
        var progressDrawable = <android.graphics.drawable.LayerDrawable>bar.getProgressDrawable();

        if (progressDrawable.getNumberOfLayers && progressDrawable.getNumberOfLayers() > 0) {
            var backgroundDrawable = progressDrawable.getDrawable(0);
            if (backgroundDrawable) {
                backgroundDrawable.setColorFilter(newValue, android.graphics.PorterDuff.Mode.SRC_IN);
            }
        }
    }

    private static resetBackgroundAndBorderProperty(view: view.View, nativeValue: number) {
        var bar = <android.widget.ProgressBar>view._nativeView;
        // Do nothing.
    }

    public static registerHandlers() {
        style.registerHandler(style.colorProperty, new stylersCommon.StylePropertyChangedHandler(
            ProgressStyler.setColorProperty,
            ProgressStyler.resetColorProperty), "Progress");

        style.registerHandler(style.backgroundColorProperty, new stylersCommon.StylePropertyChangedHandler(
            ProgressStyler.setBackgroundAndBorderProperty,
            ProgressStyler.resetBackgroundAndBorderProperty), "Progress");

        style.registerHandler(style.borderWidthProperty, ignorePropertyHandler, "Progress");
        style.registerHandler(style.borderColorProperty, ignorePropertyHandler, "Progress");
        style.registerHandler(style.borderRadiusProperty, ignorePropertyHandler, "Progress");
        style.registerHandler(style.backgroundInternalProperty, ignorePropertyHandler, "Progress");
    }
}

export class SliderStyler implements definition.stylers.Styler {
    private static setColorProperty(view: view.View, newValue: any) {
        var bar = <android.widget.SeekBar>view._nativeView;
        bar.getThumb().setColorFilter(newValue, android.graphics.PorterDuff.Mode.SRC_IN);
    }

    private static resetColorProperty(view: view.View, nativeValue: number) {
        var bar = <android.widget.SeekBar>view._nativeView;
        bar.getThumb().clearColorFilter();
    }

    private static setBackgroundAndBorderProperty(view: view.View, newValue: any) {
        var bar = <android.widget.SeekBar>view._nativeView;
        bar.getProgressDrawable().setColorFilter(newValue, android.graphics.PorterDuff.Mode.SRC_IN);
    }

    private static resetBackgroundAndBorderProperty(view: view.View, nativeValue: number) {
        var bar = <android.widget.SeekBar>view._nativeView;
        // Do nothing.
    }

    public static registerHandlers() {
        style.registerHandler(style.colorProperty, new stylersCommon.StylePropertyChangedHandler(
            SliderStyler.setColorProperty,
            SliderStyler.resetColorProperty), "Slider");

        style.registerHandler(style.backgroundColorProperty, new stylersCommon.StylePropertyChangedHandler(
            SliderStyler.setBackgroundAndBorderProperty,
            SliderStyler.resetBackgroundAndBorderProperty), "Slider");

        style.registerHandler(style.borderWidthProperty, ignorePropertyHandler, "Slider");
        style.registerHandler(style.borderColorProperty, ignorePropertyHandler, "Slider");
        style.registerHandler(style.borderRadiusProperty, ignorePropertyHandler, "Slider");
        style.registerHandler(style.backgroundInternalProperty, ignorePropertyHandler, "Slider");
    }
}

export class SwitchStyler implements definition.stylers.Styler {
    private static setColorProperty(view: view.View, newValue: any) {
        var sw = <android.widget.Switch>view._nativeView;

        var drawable = <android.graphics.drawable.StateListDrawable>sw.getThumbDrawable();
        if (drawable) {
            drawable.setColorFilter(newValue, android.graphics.PorterDuff.Mode.SRC_IN);
        }
    }

    private static resetColorProperty(view: view.View, nativeValue: number) {
        var sw = <android.widget.Switch>view._nativeView;
        // Do nothing.
    }

    private static setBackgroundAndBorderProperty(view: view.View, newValue: any) {
        var sw = <android.widget.Switch>view._nativeView;

        var drawable = <android.graphics.drawable.StateListDrawable>sw.getTrackDrawable();
        if (drawable) {
            drawable.setColorFilter(newValue, android.graphics.PorterDuff.Mode.SRC_IN);
        }
    }

    private static resetBackgroundAndBorderProperty(view: view.View, nativeValue: number) {
        var sw = <android.widget.Switch>view._nativeView;
        // Do nothing.
    }

    public static registerHandlers() {
        style.registerHandler(style.colorProperty, new stylersCommon.StylePropertyChangedHandler(
            SwitchStyler.setColorProperty,
            SwitchStyler.resetColorProperty), "Switch");

        style.registerHandler(style.backgroundColorProperty, new stylersCommon.StylePropertyChangedHandler(
            SwitchStyler.setBackgroundAndBorderProperty,
            SwitchStyler.resetBackgroundAndBorderProperty), "Switch");

        style.registerHandler(style.borderWidthProperty, ignorePropertyHandler, "Switch");
        style.registerHandler(style.borderColorProperty, ignorePropertyHandler, "Switch");
        style.registerHandler(style.borderRadiusProperty, ignorePropertyHandler, "Switch");
        style.registerHandler(style.backgroundInternalProperty, ignorePropertyHandler, "Switch");
    }
}

export class SearchBarStyler implements definition.stylers.Styler {

    private static getBackgroundColorProperty(view: view.View): any {
        var bar = <android.widget.SearchView>view._nativeView;
        return bar.getDrawingCacheBackgroundColor();
    }

    private static setBackgroundColorProperty(view: view.View, newValue: any) {
        var bar = <android.widget.SearchView>view._nativeView;
        bar.setBackgroundColor(newValue);
        SearchBarStyler._changeSearchViewPlateBackgroundColor(bar, newValue);
    }

    private static resetBackgroundColorProperty(view: view.View, nativeValue: any) {
        var bar = <android.widget.SearchView>view._nativeView;
        bar.setBackgroundColor(nativeValue);
        SearchBarStyler._changeSearchViewPlateBackgroundColor(bar, nativeValue);
    }

    private static getColorProperty(view: view.View): any {
        var bar = <android.widget.SearchView>view._nativeView;
        var textView = SearchBarStyler._getSearchViewTextView(bar);

        if (textView) {
            return textView.getCurrentTextColor();
        }

        return undefined;
    }

    private static setColorProperty(view: view.View, newValue: any) {
        var bar = <android.widget.SearchView>view._nativeView;
        SearchBarStyler._changeSearchViewTextColor(bar, newValue);
    }

    private static resetColorProperty(view: view.View, nativeValue: any) {
        var bar = <android.widget.SearchView>view._nativeView;
        SearchBarStyler._changeSearchViewTextColor(bar, nativeValue);
    }

    // font
    private static setFontInternalProperty(view: view.View, newValue: any, nativeValue: any) {
        var bar = <android.widget.SearchView>view.android;
        var textView = SearchBarStyler._getSearchViewTextView(bar);

        var fontValue = <font.Font>newValue;

        var typeface = fontValue.getAndroidTypeface();
        if (typeface) {
            textView.setTypeface(typeface);
        }
        else {
            textView.setTypeface(nativeValue.typeface);
        }

        if (fontValue.fontSize) {
            textView.setTextSize(fontValue.fontSize);
        }
        else {
            textView.setTextSize(android.util.TypedValue.COMPLEX_UNIT_PX, nativeValue.size);
        }
    }

    private static resetFontInternalProperty(view: view.View, nativeValue: any) {
        var bar = <android.widget.SearchView>view.android;
        var textView = SearchBarStyler._getSearchViewTextView(bar);
        textView.setTypeface(nativeValue.typeface);
        textView.setTextSize(android.util.TypedValue.COMPLEX_UNIT_PX, nativeValue.size);
    }

    private static getNativeFontInternalValue(view: view.View): any {
        var bar = <android.widget.SearchView>view.android;
        var textView = SearchBarStyler._getSearchViewTextView(bar);
        return {
            typeface: textView.getTypeface(),
            size: textView.getTextSize()
        };
    }

    public static registerHandlers() {
        style.registerHandler(style.backgroundColorProperty, new stylersCommon.StylePropertyChangedHandler(
            SearchBarStyler.setBackgroundColorProperty,
            SearchBarStyler.resetBackgroundColorProperty,
            SearchBarStyler.getBackgroundColorProperty), "SearchBar");

        style.registerHandler(style.colorProperty, new stylersCommon.StylePropertyChangedHandler(
            SearchBarStyler.setColorProperty,
            SearchBarStyler.resetColorProperty,
            SearchBarStyler.getColorProperty), "SearchBar");

        style.registerHandler(style.fontInternalProperty, new stylersCommon.StylePropertyChangedHandler(
            SearchBarStyler.setFontInternalProperty,
            SearchBarStyler.resetFontInternalProperty,
            SearchBarStyler.getNativeFontInternalValue), "SearchBar");
    }

    private static _getSearchViewTextView(bar: android.widget.SearchView): android.widget.TextView {
        var id = bar.getContext().getResources().getIdentifier("android:id/search_src_text", null, null);
        return <android.widget.TextView>bar.findViewById(id);
    }

    private static _changeSearchViewTextColor(bar: android.widget.SearchView, color: number) {
        var textView = SearchBarStyler._getSearchViewTextView(bar);
        if (textView) {
            textView.setTextColor(color);
        }
    }

    private static _changeSearchViewPlateBackgroundColor(bar: android.widget.SearchView, color: number) {
        var id = bar.getContext().getResources().getIdentifier("android:id/search_plate", null, null);
        var textView = <android.view.View>bar.findViewById(id);
        if (textView) {
            textView.setBackgroundColor(color);
        }
    }
}

export class ActionBarStyler implements definition.stylers.Styler {
    // color
    private static setColorProperty(view: view.View, newValue: any) {
        var toolbar = (<android.support.v7.widget.Toolbar>view._nativeView);
        toolbar.setTitleTextColor(newValue);

    }

    private static resetColorProperty(view: view.View, nativeValue: any) {
        // there is no toolbar.getTitleTextColor - so default to black
        if (types.isNullOrUndefined(nativeValue)) {
            nativeValue = android.graphics.Color.BLACK;
        }
        (<android.support.v7.widget.Toolbar>view._nativeView).setTitleTextColor(nativeValue);
    }

    public static registerHandlers() {
        style.registerHandler(style.colorProperty, new stylersCommon.StylePropertyChangedHandler(
            ActionBarStyler.setColorProperty,
            ActionBarStyler.resetColorProperty), "ActionBar");
    }
}

export class TabViewStyler implements definition.stylers.Styler {
    // color
    private static setColorProperty(view: view.View, newValue: any) {
        var tab = <tabView.TabView>view;
        if (tab.items && tab.items.length > 0) {
            var tabLayout = tab._getAndroidTabView();

            for (var i = 0; i < tab.items.length; i++) {
                tabLayout.getTextViewForItemAt(i).setTextColor(newValue);
            }
        }
    }

    private static resetColorProperty(view: view.View, nativeValue: any) {
        if (types.isNullOrUndefined(nativeValue)) {
            return;
        }

        var tab = <tabView.TabView>view;

        if (tab.items && tab.items.length > 0) {
            var tabLayout = tab._getAndroidTabView();

            for (var i = 0; i < tab.items.length; i++) {
                tabLayout.getTextViewForItemAt(i).setTextColor(nativeValue);
            }
        }
    }

    private static getColorProperty(view: view.View): any {
        var tab = <tabView.TabView>view;
        var tv: android.widget.TextView = tab._getAndroidTabView().getTextViewForItemAt(0);
        if (tv) {
            return tv.getTextColors().getDefaultColor();
        }
        else {
            return null;
        }
    }

    // font
    private static setFontInternalProperty(view: view.View, newValue: any, nativeValue: any) {
        var tab = <tabView.TabView>view;
        var fontValue = <font.Font>newValue;
        var typeface = fontValue.getAndroidTypeface();

        if (tab.items && tab.items.length > 0) {
            var tabLayout = tab._getAndroidTabView();

            for (var i = 0; i < tab.items.length; i++) {
                let tv = tabLayout.getTextViewForItemAt(i);
                if (typeface) {
                    tv.setTypeface(typeface);
                }
                else {
                    tv.setTypeface(nativeValue.typeface);
                }

                if (fontValue.fontSize) {
                    tv.setTextSize(fontValue.fontSize);
                }
                else {
                    tv.setTextSize(android.util.TypedValue.COMPLEX_UNIT_PX, nativeValue.size);
                }
            }
        }
    }

    private static resetFontInternalProperty(view: view.View, nativeValue: any) {
        var tab = <tabView.TabView>view;

        if (tab.items && tab.items.length > 0) {
            var tabLayout = tab._getAndroidTabView();

            for (var i = 0; i < tab.items.length; i++) {
                let tv = tabLayout.getTextViewForItemAt(i);
                tv.setTypeface(nativeValue.typeface);
                tv.setTextSize(android.util.TypedValue.COMPLEX_UNIT_PX, nativeValue.size);
            }
        }
    }

    private static getNativeFontInternalValue(view: view.View): any {
        var tab = <tabView.TabView>view;
        var tv: android.widget.TextView = tab._getAndroidTabView().getTextViewForItemAt(0);
        if (tv) {
            return {
                typeface: tv.getTypeface(),
                size: tv.getTextSize()
            }
        }
        else {
            return null;
        }
    }

    public static registerHandlers() {
        style.registerHandler(style.colorProperty, new stylersCommon.StylePropertyChangedHandler(
            TabViewStyler.setColorProperty,
            TabViewStyler.resetColorProperty,
            TabViewStyler.getColorProperty), "TabView");

        style.registerHandler(style.fontInternalProperty, new stylersCommon.StylePropertyChangedHandler(
            TabViewStyler.setFontInternalProperty,
            TabViewStyler.resetFontInternalProperty,
            TabViewStyler.getNativeFontInternalValue), "TabView");
    }
}

// Register all styler at the end.
export function _registerDefaultStylers() {
    style.registerNoStylingClass("Frame");
    DefaultStyler.registerHandlers();
    ImageStyler.registerHandlers();
    TextViewStyler.registerHandlers();
    ActivityIndicatorStyler.registerHandlers();
    SegmentedBarStyler.registerHandlers();
    SearchBarStyler.registerHandlers();
    ActionBarStyler.registerHandlers();
    TabViewStyler.registerHandlers();
    ProgressStyler.registerHandlers();
    SwitchStyler.registerHandlers();
    SliderStyler.registerHandlers();
}

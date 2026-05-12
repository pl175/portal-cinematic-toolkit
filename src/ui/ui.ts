import { PCT_ErrorLogger } from "../core/error-logger";

/************************
 * PORTAL CAMERA TOOLKIT (PCT)
 * UI
 *************************/

export namespace PCT_UI {
  export const COLORS = {
    BLACK: mod.CreateVector(0, 0, 0),
    GREY: mod.CreateVector(0.5, 0.5, 0.5),
    WHITE: mod.CreateVector(1, 1, 1),
    RED: mod.CreateVector(1, 0, 0),
    GREEN: mod.CreateVector(0, 1, 0),
    BLUE: mod.CreateVector(0, 0, 1),
    YELLOW: mod.CreateVector(1, 1, 0),
  };

  type Receiver = mod.Player | mod.Team;
  type UIParent = UINode | mod.UIWidget;

  export enum Type {
    Root = "root",
    Container = "container",
    Text = "text",
    Button = "button",
    Image = "image",
    Unknown = "unknown",
  }

  export type Size = {
    width: number;
    height: number;
  };

  export type Position = {
    x: number;
    y: number;
  };

  type BaseParams = {
    type?: Type;
    parent?: UIParent;
    visible?: boolean;
    depth?: mod.UIDepth;
    anchor?: mod.UIAnchor;
    name?: string;
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    bgFill?: mod.UIBgFill;
    bgColor?: mod.Vector;
    bgAlpha?: number;
    padding?: number;
  };

  export type TextParams = BaseParams & {
    message: mod.Message;
    textSize?: number;
    textColor?: mod.Vector;
    textAlpha?: number;
    textAnchor?: mod.UIAnchor;
  };

  export type LabelParams = {
    message: mod.Message;
    textSize?: number;
    textColor?: mod.Vector;
    textAlpha?: number;
    textAnchor?: mod.UIAnchor;
    padding?: number;
  };

  export type ButtonParams = BaseParams & {
    buttonEnabled?: boolean;
    baseColor?: mod.Vector;
    baseAlpha?: number;
    disabledColor?: mod.Vector;
    disabledAlpha?: number;
    pressedColor?: mod.Vector;
    pressedAlpha?: number;
    hoverColor?: mod.Vector;
    hoverAlpha?: number;
    focusedColor?: mod.Vector;
    focusedAlpha?: number;
    disabledOnClick?: boolean;
    onClick?: (player: mod.Player) => Promise<void>;
    label?: LabelParams;
  };

  export type ImageParams = BaseParams & {
    imageType?: mod.UIImageType;
    imageColor?: mod.Vector;
    imageAlpha?: number;
  };

  type ChildContainerParams = Omit<
    ContainerParams,
    "type" | "childrenParams"
  > & {
    type: Type.Container;
    childrenParams?: ChildParams[];
  };

  type ChildTextParams = Omit<TextParams, "type"> & {
    type: Type.Text;
  };

  type ChildButtonParams = Omit<ButtonParams, "type"> & {
    type: Type.Button;
  };

  type ChildImageParams = Omit<ImageParams, "type"> & {
    type: Type.Image;
  };

  type ChildParams =
    | ChildContainerParams
    | ChildTextParams
    | ChildButtonParams
    | ChildImageParams;

  export type ContainerParams = BaseParams & {
    showOutline?: boolean;
    outlineColor?: mod.Vector;
    outlineAlpha?: number;
    childrenParams?: ChildParams[];
  };

  type ChildElement = Container | Text | Button | Image;

  type WidgetCreateResult = {
    name: string;
    widget: mod.UIWidget;
  };

  type CommonWidgetSettings = {
    position: mod.Vector;
    size: mod.Vector;
    anchor: mod.UIAnchor;
    visible: boolean;
    padding: number;
    bgColor: mod.Vector;
    bgAlpha: number;
    bgFill: mod.UIBgFill;
    depth: mod.UIDepth;
  };

  const BUTTON_HANDLERS = new Map<
    string,
    (player: mod.Player) => Promise<void>
  >();
  const BUTTON_DISABLE_ON_CLICK = new Map<string, boolean>();
  const BUTTON_COOLDOWNS = new Set<string>();

  let uniqueNameCounter = 0;

  function xy(x = 0, y = 0): mod.Vector {
    return mod.CreateVector(x, y, 0);
  }

  function getCommonWidgetSettings(params: BaseParams): CommonWidgetSettings {
    return {
      position: xy(params.x ?? 0, params.y ?? 0),
      size: xy(params.width ?? 0, params.height ?? 0),
      anchor: params.anchor ?? mod.UIAnchor.Center,
      visible: params.visible ?? true,
      padding: params.padding ?? 0,
      bgColor: params.bgColor ?? COLORS.WHITE,
      bgAlpha: params.bgAlpha ?? 0,
      bgFill: params.bgFill ?? mod.UIBgFill.None,
      depth: params.depth ?? mod.UIDepth.AboveGameUI,
    };
  }

  function sanitizeNameSegment(value: string): string {
    const sanitized = value.trim().replace(/[^a-zA-Z0-9_]+/g, "_");
    return sanitized.length > 0 ? sanitized : "ui";
  }

  function getReceiverNameSegment(receiver?: Receiver): string {
    return receiver ? `r${mod.GetObjId(receiver)}` : "global";
  }

  function createUniqueName(
    parent: UINode,
    receiver: Receiver | undefined,
    requestedName: string | undefined,
    fallbackBase: string,
  ): string {
    const id = uniqueNameCounter++;
    const parentSegment = sanitizeNameSegment(parent.name);
    const baseSegment = sanitizeNameSegment(requestedName ?? fallbackBase);
    const receiverSegment = getReceiverNameSegment(receiver);

    return `${parentSegment}_${receiverSegment}_${baseSegment}_${id}`;
  }

  function getWidgetOrError(name: string): mod.UIWidget {
    const widget = mod.FindUIWidgetWithName(name);
    if (!widget) {
      void PCT_ErrorLogger.New(
        getWidgetOrError.name,
        `Failed to find widget with name: ${name}`,
        1,
      );
      throw new Error(`UI widget not found after creation: ${name}`);
    }
    return widget;
  }

  function asUINode(parent?: UIParent): UINode {
    if (!parent) return ROOT;
    if (parent instanceof UINode) return parent;

    const widgetName = mod.GetUIWidgetName(parent);
    return new UINode(
      parent,
      Type.Unknown,
      widgetName && widgetName.length > 0
        ? widgetName
        : createUniqueName(ROOT, undefined, "wrapped_parent", Type.Unknown),
    );
  }

  function attachButtonHandler(
    buttonName: string,
    handler?: (player: mod.Player) => Promise<void>,
    disabledOnClick = true,
  ): void {
    if (!handler) return;
    BUTTON_HANDLERS.set(buttonName, handler);
    BUTTON_DISABLE_ON_CLICK.set(buttonName, disabledOnClick);
  }

  function detachButtonHandler(buttonName: string): void {
    BUTTON_HANDLERS.delete(buttonName);
    BUTTON_DISABLE_ON_CLICK.delete(buttonName);
  }

  function createContainerWidget(
    params: ContainerParams,
    parent: UINode,
    receiver?: Receiver,
  ): WidgetCreateResult {
    const name = createUniqueName(
      parent,
      receiver,
      params.name,
      Type.Container,
    );
    const common = getCommonWidgetSettings(params);

    if (receiver === undefined) {
      mod.AddUIContainer(
        name,
        common.position,
        common.size,
        common.anchor,
        parent.uiWidget,
        common.visible,
        common.padding,
        common.bgColor,
        common.bgAlpha,
        common.bgFill,
        common.depth,
      );
    } else {
      mod.AddUIContainer(
        name,
        common.position,
        common.size,
        common.anchor,
        parent.uiWidget,
        common.visible,
        common.padding,
        common.bgColor,
        common.bgAlpha,
        common.bgFill,
        common.depth,
        receiver,
      );
    }

    return { name, widget: getWidgetOrError(name) };
  }

  function createTextWidget(
    params: TextParams,
    parent: UINode,
    receiver?: Receiver,
  ): WidgetCreateResult {
    const name = createUniqueName(parent, receiver, params.name, Type.Text);
    const common = getCommonWidgetSettings(params);

    if (receiver === undefined) {
      mod.AddUIText(
        name,
        common.position,
        common.size,
        common.anchor,
        parent.uiWidget,
        common.visible,
        common.padding,
        common.bgColor,
        common.bgAlpha,
        common.bgFill,
        params.message,
        params.textSize ?? 36,
        params.textColor ?? COLORS.BLACK,
        params.textAlpha ?? 1,
        params.textAnchor ?? mod.UIAnchor.Center,
        common.depth,
      );
    } else {
      mod.AddUIText(
        name,
        common.position,
        common.size,
        common.anchor,
        parent.uiWidget,
        common.visible,
        common.padding,
        common.bgColor,
        common.bgAlpha,
        common.bgFill,
        params.message,
        params.textSize ?? 36,
        params.textColor ?? COLORS.BLACK,
        params.textAlpha ?? 1,
        params.textAnchor ?? mod.UIAnchor.Center,
        common.depth,
        receiver,
      );
    }

    return { name, widget: getWidgetOrError(name) };
  }

  function createImageWidget(
    params: ImageParams,
    parent: UINode,
    receiver?: Receiver,
  ): WidgetCreateResult {
    const name = createUniqueName(parent, receiver, params.name, Type.Image);
    const common = getCommonWidgetSettings(params);

    if (receiver === undefined) {
      mod.AddUIImage(
        name,
        common.position,
        common.size,
        common.anchor,
        parent.uiWidget,
        common.visible,
        common.padding,
        common.bgColor,
        common.bgAlpha,
        common.bgFill,
        params.imageType ?? mod.UIImageType.QuestionMark,
        params.imageColor ?? COLORS.WHITE,
        params.imageAlpha ?? 1,
        common.depth,
      );
    } else {
      mod.AddUIImage(
        name,
        common.position,
        common.size,
        common.anchor,
        parent.uiWidget,
        common.visible,
        common.padding,
        common.bgColor,
        common.bgAlpha,
        common.bgFill,
        params.imageType ?? mod.UIImageType.QuestionMark,
        params.imageColor ?? COLORS.WHITE,
        params.imageAlpha ?? 1,
        common.depth,
        receiver,
      );
    }

    return { name, widget: getWidgetOrError(name) };
  }

  function mountChild(
    definition: ChildParams,
    parent: Container,
  ): ChildElement {
    switch (definition.type) {
      case Type.Text:
        return new Text({ ...definition, parent });

      case Type.Button:
        return new Button({ ...definition, parent });

      case Type.Image:
        return new Image({ ...definition, parent });

      case Type.Container:
        return new Container({ ...definition, parent });
    }
  }

  export class UINode {
    public constructor(
      public readonly uiWidget: mod.UIWidget,
      public readonly type: Type,
      public readonly name: string,
    ) {}
  }

  export const ROOT = new UINode(mod.GetUIRoot(), Type.Root, "ui_root");

  export class UIElement extends UINode {
    public constructor(
      uiWidget: mod.UIWidget,
      type: Type,
      name: string,
      public readonly parent: UINode,
    ) {
      super(uiWidget, type, name);
    }

    public get visible(): boolean {
      return mod.GetUIWidgetVisible(this.uiWidget);
    }

    public set visible(value: boolean) {
      mod.SetUIWidgetVisible(this.uiWidget, value);
    }

    public show(): this {
      this.visible = true;
      return this;
    }

    public hide(): this {
      this.visible = false;
      return this;
    }

    public toggle(): this {
      this.visible = !this.visible;
      return this;
    }

    public setVisible(value: boolean): this {
      this.visible = value;
      return this;
    }

    public destroy(): void {
      mod.DeleteUIWidget(this.uiWidget);
    }

    public get position(): Position {
      const value = mod.GetUIWidgetPosition(this.uiWidget);
      return { x: mod.XComponentOf(value), y: mod.YComponentOf(value) };
    }

    public set position(value: Position) {
      mod.SetUIWidgetPosition(this.uiWidget, xy(value.x, value.y));
    }

    public setPosition(value: Position): this {
      this.position = value;
      return this;
    }

    public get size(): Size {
      const value = mod.GetUIWidgetSize(this.uiWidget);
      return {
        width: mod.XComponentOf(value),
        height: mod.YComponentOf(value),
      };
    }

    public set size(value: Size) {
      mod.SetUIWidgetSize(this.uiWidget, xy(value.width, value.height));
    }

    public setSize(value: Size): this {
      this.size = value;
      return this;
    }

    public get anchor(): mod.UIAnchor {
      return mod.GetUIWidgetAnchor(this.uiWidget);
    }

    public set anchor(value: mod.UIAnchor) {
      mod.SetUIWidgetAnchor(this.uiWidget, value);
    }

    public setAnchor(value: mod.UIAnchor): this {
      this.anchor = value;
      return this;
    }

    public get padding(): number {
      return mod.GetUIWidgetPadding(this.uiWidget);
    }

    public set padding(value: number) {
      mod.SetUIWidgetPadding(this.uiWidget, value);
    }

    public setPadding(value: number): this {
      this.padding = value;
      return this;
    }

    public get depth(): mod.UIDepth {
      return mod.GetUIWidgetDepth(this.uiWidget);
    }

    public set depth(value: mod.UIDepth) {
      mod.SetUIWidgetDepth(this.uiWidget, value);
    }

    public setDepth(value: mod.UIDepth): this {
      this.depth = value;
      return this;
    }

    public get bgColor(): mod.Vector {
      return mod.GetUIWidgetBgColor(this.uiWidget);
    }

    public set bgColor(value: mod.Vector) {
      mod.SetUIWidgetBgColor(this.uiWidget, value);
    }

    public setBgColor(value: mod.Vector): this {
      this.bgColor = value;
      return this;
    }

    public get bgAlpha(): number {
      return mod.GetUIWidgetBgAlpha(this.uiWidget);
    }

    public set bgAlpha(value: number) {
      mod.SetUIWidgetBgAlpha(this.uiWidget, value);
    }

    public setBgAlpha(value: number): this {
      this.bgAlpha = value;
      return this;
    }

    public get bgFill(): mod.UIBgFill {
      return mod.GetUIWidgetBgFill(this.uiWidget);
    }

    public set bgFill(value: mod.UIBgFill) {
      mod.SetUIWidgetBgFill(this.uiWidget, value);
    }

    public setBgFill(value: mod.UIBgFill): this {
      this.bgFill = value;
      return this;
    }
  }

  export class Container extends UIElement {
    private readonly _children: ChildElement[];
    private _outline?: Container;

    public constructor(params: ContainerParams, receiver?: Receiver) {
      const parent = asUINode(params.parent);
      const created = createContainerWidget(params, parent, receiver);

      super(created.widget, Type.Container, created.name, parent);

      this._children = [];

      if (params.showOutline ?? false) {
        this._outline = new Container(
          {
            parent: this,
            name: params.name ? `${params.name}_outline` : "outline",
            x: 0,
            y: 0,
            width: params.width,
            height: params.height,
            anchor: params.anchor ?? mod.UIAnchor.Center,
            visible: params.visible ?? true,
            depth: params.depth ?? mod.UIDepth.AboveGameUI,
            bgFill: mod.UIBgFill.OutlineThin,
            bgColor: params.outlineColor ?? COLORS.WHITE,
            bgAlpha: params.outlineAlpha ?? 0.5,
            showOutline: false,
          },
          receiver,
        );

        this.syncOutlineToContainer();
      }

      for (const child of params.childrenParams ?? []) {
        const instance = mountChild(child, this);
        if (instance) this._children.push(instance);
      }
    }

    public get children(): ChildElement[] {
      return this._children;
    }

    private syncOutlineToContainer(): void {
      if (!this._outline) return;

      this._outline.position = { x: 0, y: 0 };
      this._outline.size = this.size;
      this._outline.anchor = this.anchor;
      this._outline.depth = this.depth;
      this._outline.visible = this.visible;
    }

    public override get visible(): boolean {
      return super.visible;
    }

    public override set visible(value: boolean) {
      super.visible = value;
      this.syncOutlineToContainer();
    }

    public override get position(): Position {
      return super.position;
    }

    public override set position(value: Position) {
      super.position = value;
      this.syncOutlineToContainer();
    }

    public override get size(): Size {
      return super.size;
    }

    public override set size(value: Size) {
      super.size = value;
      this.syncOutlineToContainer();
    }

    public override get anchor(): mod.UIAnchor {
      return super.anchor;
    }

    public override set anchor(value: mod.UIAnchor) {
      super.anchor = value;
      this.syncOutlineToContainer();
    }

    public override get depth(): mod.UIDepth {
      return super.depth;
    }

    public override set depth(value: mod.UIDepth) {
      super.depth = value;
      this.syncOutlineToContainer();
    }
  }

  export class Text extends UIElement {
    public constructor(params: TextParams, receiver?: Receiver) {
      const parent = asUINode(params.parent);
      const created = createTextWidget(params, parent, receiver);

      super(created.widget, Type.Text, created.name, parent);
    }

    public set message(value: mod.Message) {
      mod.SetUITextLabel(this.uiWidget, value);
    }

    public setMessage(value: mod.Message): this {
      this.message = value;
      return this;
    }

    public get textAnchor(): mod.UIAnchor {
      return mod.GetUITextAnchor(this.uiWidget);
    }

    public set textAnchor(value: mod.UIAnchor) {
      mod.SetUITextAnchor(this.uiWidget, value);
    }

    public setTextAnchor(value: mod.UIAnchor): this {
      this.textAnchor = value;
      return this;
    }

    public set textColor(value: mod.Vector) {
      mod.SetUITextColor(this.uiWidget, value);
    }

    public setTextColor(value: mod.Vector): this {
      this.textColor = value;
      return this;
    }

    public set textAlpha(value: number) {
      mod.SetUITextAlpha(this.uiWidget, value);
    }

    public setTextAlpha(value: number): this {
      this.textAlpha = value;
      return this;
    }
  }

  export class Button extends UIElement {
    public readonly buttonName: string;
    public readonly buttonUiWidget: mod.UIWidget;

    private _buttonClickDisabled: boolean;
    private _label?: Text;

    public constructor(params: ButtonParams, receiver?: Receiver) {
      const parent = asUINode(params.parent);

      const frame = new Container(
        {
          type: Type.Container,
          name: params.name,
          x: params.x,
          y: params.y,
          width: params.width,
          height: params.height,
          anchor: params.anchor,
          parent,
          visible: params.visible,
          padding: 0,
          bgColor: COLORS.GREY,
          bgAlpha: 0,
          bgFill: mod.UIBgFill.None,
          depth: params.depth ?? mod.UIDepth.AboveGameUI,
        },
        receiver,
      );

      super(frame.uiWidget, Type.Button, frame.name, frame.parent);

      const buttonName = createUniqueName(
        frame,
        receiver,
        params.name,
        "button_core",
      );
      const common = getCommonWidgetSettings({
        ...params,
        x: 0,
        y: 0,
        bgAlpha: params.bgAlpha ?? 1,
        bgFill: params.bgFill ?? mod.UIBgFill.Solid,
      });

      if (receiver === undefined) {
        mod.AddUIButton(
          buttonName,
          common.position,
          common.size,
          common.anchor,
          frame.uiWidget,
          common.visible,
          common.padding,
          common.bgColor,
          common.bgAlpha,
          common.bgFill,
          params.buttonEnabled ?? true,
          params.baseColor ?? COLORS.WHITE,
          params.baseAlpha ?? 0.1,
          params.disabledColor ?? COLORS.WHITE,
          params.disabledAlpha ?? 0.05,
          params.pressedColor ?? COLORS.WHITE,
          params.pressedAlpha ?? 0.1,
          params.hoverColor ?? COLORS.WHITE,
          params.hoverAlpha ?? 1,
          params.focusedColor ?? COLORS.WHITE,
          params.focusedAlpha ?? 1,
          common.depth,
        );
      } else {
        mod.AddUIButton(
          buttonName,
          common.position,
          common.size,
          common.anchor,
          frame.uiWidget,
          common.visible,
          common.padding,
          common.bgColor,
          common.bgAlpha,
          common.bgFill,
          params.buttonEnabled ?? true,
          params.baseColor ?? COLORS.WHITE,
          params.baseAlpha ?? 0.1,
          params.disabledColor ?? COLORS.WHITE,
          params.disabledAlpha ?? 0.05,
          params.pressedColor ?? COLORS.WHITE,
          params.pressedAlpha ?? 0.1,
          params.hoverColor ?? COLORS.WHITE,
          params.hoverAlpha ?? 1,
          params.focusedColor ?? COLORS.WHITE,
          params.focusedAlpha ?? 1,
          common.depth,
          receiver,
        );
      }

      attachButtonHandler(
        buttonName,
        params.onClick,
        params.disabledOnClick ?? true,
      );

      this.buttonName = buttonName;
      this.buttonUiWidget = getWidgetOrError(buttonName);
      this._buttonClickDisabled = false;

      if (params.label) {
        this._label = new Text(
          {
            ...params.label,
            name: createUniqueName(frame, receiver, "label", "label"),
            parent: frame,
            width: params.width,
            height: params.height,
            visible: true,
            depth: params.depth,
          },
          receiver,
        );
      }
    }

    public override destroy(): void {
      detachButtonHandler(this.buttonName);
      super.destroy();
    }

    public get buttonClickDisabled(): boolean {
      return this._buttonClickDisabled;
    }

    public set buttonClickDisabled(value: boolean) {
      this._buttonClickDisabled = value;
    }

    public get enabled(): boolean {
      return mod.GetUIButtonEnabled(this.buttonUiWidget);
    }

    public set enabled(value: boolean) {
      mod.SetUIButtonEnabled(this.buttonUiWidget, value);
    }

    public setEnabled(value: boolean): this {
      this.enabled = value;
      return this;
    }

    public get alphaBase(): number {
      return mod.GetUIButtonAlphaBase(this.buttonUiWidget);
    }

    public set alphaBase(value: number) {
      mod.SetUIButtonAlphaBase(this.buttonUiWidget, value);
    }

    public setAlphaBase(value: number): this {
      this.alphaBase = value;
      return this;
    }

    public get alphaDisabled(): number {
      return mod.GetUIButtonAlphaDisabled(this.buttonUiWidget);
    }

    public set alphaDisabled(value: number) {
      mod.SetUIButtonAlphaDisabled(this.buttonUiWidget, value);
    }

    public setAlphaDisabled(value: number): this {
      this.alphaDisabled = value;
      return this;
    }

    public get alphaFocused(): number {
      return mod.GetUIButtonAlphaFocused(this.buttonUiWidget);
    }

    public set alphaFocused(value: number) {
      mod.SetUIButtonAlphaFocused(this.buttonUiWidget, value);
    }

    public setAlphaFocused(value: number): this {
      this.alphaFocused = value;
      return this;
    }

    public get alphaHover(): number {
      return mod.GetUIButtonAlphaHover(this.buttonUiWidget);
    }

    public set alphaHover(value: number) {
      mod.SetUIButtonAlphaHover(this.buttonUiWidget, value);
    }

    public setAlphaHover(value: number): this {
      this.alphaHover = value;
      return this;
    }

    public get alphaPressed(): number {
      return mod.GetUIButtonAlphaPressed(this.buttonUiWidget);
    }

    public set alphaPressed(value: number) {
      mod.SetUIButtonAlphaPressed(this.buttonUiWidget, value);
    }

    public setAlphaPressed(value: number): this {
      this.alphaPressed = value;
      return this;
    }

    public get colorBase(): mod.Vector {
      return mod.GetUIButtonColorBase(this.buttonUiWidget);
    }

    public set colorBase(value: mod.Vector) {
      mod.SetUIButtonColorBase(this.buttonUiWidget, value);
    }

    public setColorBase(value: mod.Vector): this {
      this.colorBase = value;
      return this;
    }

    public get colorDisabled(): mod.Vector {
      return mod.GetUIButtonColorDisabled(this.buttonUiWidget);
    }

    public set colorDisabled(value: mod.Vector) {
      mod.SetUIButtonColorDisabled(this.buttonUiWidget, value);
    }

    public setColorDisabled(value: mod.Vector): this {
      this.colorDisabled = value;
      return this;
    }

    public get colorFocused(): mod.Vector {
      return mod.GetUIButtonColorFocused(this.buttonUiWidget);
    }

    public set colorFocused(value: mod.Vector) {
      mod.SetUIButtonColorFocused(this.buttonUiWidget, value);
    }

    public setColorFocused(value: mod.Vector): this {
      this.colorFocused = value;
      return this;
    }

    public get colorHover(): mod.Vector {
      return mod.GetUIButtonColorHover(this.buttonUiWidget);
    }

    public set colorHover(value: mod.Vector) {
      mod.SetUIButtonColorHover(this.buttonUiWidget, value);
    }

    public setColorHover(value: mod.Vector): this {
      this.colorHover = value;
      return this;
    }

    public get colorPressed(): mod.Vector {
      return mod.GetUIButtonColorPressed(this.buttonUiWidget);
    }

    public set colorPressed(value: mod.Vector) {
      mod.SetUIButtonColorPressed(this.buttonUiWidget, value);
    }

    public setColorPressed(value: mod.Vector): this {
      this.colorPressed = value;
      return this;
    }

    public set labelMessage(value: mod.Message) {
      this._label?.setMessage(value);
    }

    public setLabelMessage(value: mod.Message): this {
      this.labelMessage = value;
      return this;
    }

    public set labelColor(value: mod.Vector) {
      this._label?.setTextColor(value);
    }

    public setLabelTextColor(value: mod.Vector): this {
      this.labelColor = value;
      return this;
    }

    public set labelAlpha(value: number) {
      this._label?.setTextAlpha(value);
    }

    public setLabelTextAlpha(value: number): this {
      this.labelAlpha = value;
      return this;
    }

    public override set size(value: Size) {
      mod.SetUIWidgetSize(this.uiWidget, xy(value.width, value.height));
      mod.SetUIWidgetSize(this.buttonUiWidget, xy(value.width, value.height));
      this._label?.setSize(value);
    }

    public override setSize(value: Size): this {
      this.size = value;
      return this;
    }
  }

  export class Image extends UIElement {
    public constructor(params: ImageParams, receiver?: Receiver) {
      const parent = asUINode(params.parent);
      const created = createImageWidget(params, parent, receiver);

      super(created.widget, Type.Image, created.name, parent);
    }

    public set imageType(value: mod.UIImageType) {
      mod.SetUIImageType(this.uiWidget, value);
    }

    public setImageType(value: mod.UIImageType): this {
      this.imageType = value;
      return this;
    }

    public set imageColor(value: mod.Vector) {
      mod.SetUIImageColor(this.uiWidget, value);
    }

    public setImageColor(value: mod.Vector): this {
      this.imageColor = value;
      return this;
    }

    public set imageAlpha(value: number) {
      mod.SetUIImageAlpha(this.uiWidget, value);
    }

    public setImageAlpha(value: number): this {
      this.imageAlpha = value;
      return this;
    }
  }

  export async function OnButtonClick(
    player: mod.Player,
    widget: mod.UIWidget,
    event: mod.UIButtonEvent,
  ): Promise<void> {
    void event;

    const widgetName = mod.GetUIWidgetName(widget);

    const buttonHandler = BUTTON_HANDLERS.get(widgetName);
    if (!buttonHandler) return;

    const runButtonHandler = (): void => {
      buttonHandler(player).catch((error: unknown) => {
        PCT_ErrorLogger.New(
          OnButtonClick.name + " (" + runButtonHandler.name + ")",
          `Button Handler failed: ${String(error)}`,
          2,
        );
      });
    };

    const disableOnClick = BUTTON_DISABLE_ON_CLICK.get(widgetName) ?? true;
    if (!disableOnClick) {
      runButtonHandler();
      return;
    }

    const lockKey = `${mod.GetObjId(player)}_${widgetName}`;
    if (BUTTON_COOLDOWNS.has(lockKey)) return;

    BUTTON_COOLDOWNS.add(lockKey);
    runButtonHandler();

    await mod.Wait(0.2);
    BUTTON_COOLDOWNS.delete(lockKey);
  }
}

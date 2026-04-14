/************************
 * PORTAL CAMERA TOOLKIT (PCT)
 * BY NODONE
 * APRIL 13, 2026
 *************************/

/************************
 * PORTAL CAMERA TOOLKIT (PCT)
 * ERROR LOGGER NAMESPACE
 *************************/

export namespace PCT_ErrorLogger {
  export function New(caller: string, message: string, errorNumber: number) {
    let callerTrace = "at <unknown>";

    const stack = new Error().stack;
    if (stack) {
      const lines = stack.split("\n");

      callerTrace = lines[2]?.trim() ?? lines[3]?.trim() ?? callerTrace;
    }

    const tagS = "\n***** PORTAL CAMERA TOOLKIT ERROR START *****\n";
    const tagE = "\n***** PORTAL CAMERA TOOLKIT ERROR END *****";

    console.log(
      tagS + `ERROR <${caller}> ${message} | Called ${callerTrace}` + tagE,
    );

    for (let i = 0; i < 10; i++) {
      mod.DisplayHighlightedWorldLogMessage(
        mod.Message("PCT_ERROR_OCCURED", errorNumber),
      );
      mod.Wait(0.5);
    }
  }
}

/************************
 * PORTAL CAMERA TOOLKIT (PCT)
 * WORLD ICON CLASS
 *************************/

interface WorldIconOptions {
  text?: mod.Message;
  textEnabled?: boolean;
  icon?: mod.WorldIconImages;
  iconEnabled?: boolean;
  color?: mod.Vector;
  teamOwner?: mod.Team;
  playerOwner?: mod.Player;
}

interface WorldIconState extends WorldIconOptions {
  id: string;
  position: mod.Vector;
  textEnabled: boolean;
  iconEnabled: boolean;
}

class PCT_WIM {
  private static instance: PCT_WIM | undefined;
  private readonly icons = new Map<string, mod.WorldIcon>();
  private readonly iconStates = new Map<string, WorldIconState>();

  private constructor() {}

  static init(): PCT_WIM {
    if (PCT_WIM.instance === undefined) {
      PCT_WIM.instance = new PCT_WIM();
    }

    return PCT_WIM.instance;
  }

  private getManaged(
    id: string,
  ): { icon: mod.WorldIcon; state: WorldIconState } | null {
    const icon = this.icons.get(id);
    const state = this.iconStates.get(id);

    if (icon === undefined || state === undefined) {
      return null;
    }

    return { icon, state };
  }

  private applyOwner(
    icon: mod.WorldIcon,
    state: Pick<WorldIconState, "teamOwner" | "playerOwner">,
  ): void {
    if (state.teamOwner !== undefined) {
      mod.SetWorldIconOwner(icon, state.teamOwner);
      return;
    }

    if (state.playerOwner !== undefined) {
      mod.SetWorldIconOwner(icon, state.playerOwner);
    }
  }

  private applyState(icon: mod.WorldIcon, state: WorldIconState): void {
    this.applyOwner(icon, state);
    mod.SetWorldIconPosition(icon, state.position);

    if (state.text !== undefined) {
      mod.SetWorldIconText(icon, state.text);
    }

    if (state.icon !== undefined) {
      mod.SetWorldIconImage(icon, state.icon);
    }

    if (state.color !== undefined) {
      mod.SetWorldIconColor(icon, state.color);
    }

    mod.EnableWorldIconText(icon, state.textEnabled);
    mod.EnableWorldIconImage(icon, state.iconEnabled);
  }

  createIcon(
    id: string,
    position: mod.Vector,
    options?: WorldIconOptions,
  ): mod.WorldIcon {
    if (this.icons.has(id)) {
      this.deleteIcon(id);
    }

    const icon = mod.SpawnObject(
      mod.RuntimeSpawn_Common.WorldIcon,
      position,
      mod.CreateVector(0, 0, 0),
    ) as mod.WorldIcon;

    const state: WorldIconState = {
      id,
      position,
      text: options?.text,
      textEnabled: options?.textEnabled ?? false,
      icon: options?.icon,
      iconEnabled: options?.iconEnabled ?? false,
      color: options?.color,
      teamOwner: options?.teamOwner,
      playerOwner: options?.playerOwner,
    };

    this.applyState(icon, state);

    this.icons.set(id, icon);
    this.iconStates.set(id, state);

    return icon;
  }

  getIcon(id: string): mod.WorldIcon | undefined {
    return this.icons.get(id);
  }

  setPosition(id: string, position: mod.Vector): void {
    const managed = this.getManaged(id);
    if (managed === null) {
      return;
    }

    managed.state.position = position;
    mod.SetWorldIconPosition(managed.icon, position);
  }

  setText(id: string, text: mod.Message): void {
    const managed = this.getManaged(id);
    if (managed === null) {
      return;
    }

    managed.state.text = text;
    mod.SetWorldIconText(managed.icon, text);
  }

  setIcon(id: string, iconImage: mod.WorldIconImages): void {
    const managed = this.getManaged(id);
    if (managed === null) {
      return;
    }

    managed.state.icon = iconImage;
    mod.SetWorldIconImage(managed.icon, iconImage);
  }

  setColor(id: string, color: mod.Vector): void {
    const managed = this.getManaged(id);
    if (managed === null) {
      return;
    }

    managed.state.color = color;
    mod.SetWorldIconColor(managed.icon, color);
  }

  setTextEnabled(id: string, enabled: boolean): void {
    const managed = this.getManaged(id);
    if (managed === null) {
      return;
    }

    managed.state.textEnabled = enabled;
    mod.EnableWorldIconText(managed.icon, enabled);
  }

  setIconEnabled(id: string, enabled: boolean): void {
    const managed = this.getManaged(id);
    if (managed === null) {
      return;
    }

    managed.state.iconEnabled = enabled;
    mod.EnableWorldIconImage(managed.icon, enabled);
  }

  setEnabled(id: string, iconEnabled: boolean, textEnabled: boolean): void {
    const managed = this.getManaged(id);
    if (managed === null) {
      return;
    }

    managed.state.iconEnabled = iconEnabled;
    managed.state.textEnabled = textEnabled;

    mod.EnableWorldIconImage(managed.icon, iconEnabled);
    mod.EnableWorldIconText(managed.icon, textEnabled);
  }

  setTeamOwner(id: string, team: mod.Team): void {
    const managed = this.getManaged(id);
    if (managed === null) {
      return;
    }

    managed.state.teamOwner = team;
    managed.state.playerOwner = undefined;

    mod.SetWorldIconOwner(managed.icon, team);
  }

  setPlayerOwner(id: string, player: mod.Player): void {
    const managed = this.getManaged(id);
    if (managed === null) {
      return;
    }

    managed.state.playerOwner = player;
    managed.state.teamOwner = undefined;

    mod.SetWorldIconOwner(managed.icon, player);
  }

  deleteIcon(id: string): void {
    const icon = this.icons.get(id);
    if (icon === undefined) {
      return;
    }

    mod.UnspawnObject(icon);
    this.icons.delete(id);
    this.iconStates.delete(id);
  }

  private refreshIcon(id: string): void {
    const managed = this.getManaged(id);
    if (managed === null) {
      return;
    }

    mod.EnableWorldIconImage(managed.icon, false);
    mod.EnableWorldIconText(managed.icon, false);
    this.applyState(managed.icon, managed.state);
  }

  refreshAllIcons(): void {
    for (const id of this.iconStates.keys()) {
      this.refreshIcon(id);
    }
  }

  deleteAllIcons(): void {
    for (const icon of this.icons.values()) {
      mod.UnspawnObject(icon);
    }

    this.icons.clear();
    this.iconStates.clear();
  }

  getIconCount(): number {
    return this.icons.size;
  }

  hasIcon(id: string): boolean {
    return this.icons.has(id);
  }
}

/************************
 * PORTAL CAMERA TOOLKIT (PCT)
 * UI NAMESPACE
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

    const handler = BUTTON_HANDLERS.get(widgetName);
    if (!handler) return;

    const runHandler = (): void => {
      //TODO: CHECK IF NEEDS REMOVED
      handler(player).catch((error: unknown) => {});
    };

    const disableOnClick = BUTTON_DISABLE_ON_CLICK.get(widgetName) ?? true;
    if (!disableOnClick) {
      runHandler();
      return;
    }

    const lockKey = `${mod.GetObjId(player)}_${widgetName}`;
    if (BUTTON_COOLDOWNS.has(lockKey)) return;

    BUTTON_COOLDOWNS.add(lockKey);
    runHandler();

    await mod.Wait(0.2);
    BUTTON_COOLDOWNS.delete(lockKey);
  }
}

/************************
 * PORTAL CAMERA TOOLKIT (PCT)
 * MOD NAMESPACE
 *************************/

export namespace PCT {
  /************************
   * Enums
   *************************/

  enum DistanceType {
    XZ,
    XYZ,
  }

  enum CameraType {
    Point,
    Free,
    ThirdPerson,
  }

  enum PointSelectionType {
    PathPoint,
    MenuDelete,
    MenuMove,
  }

  enum CameraTargetType {
    Player,
    Path,
  }

  /************************
   * Types
   *************************/

  type V3 = { x: number; y: number; z: number };
  type XZ = { x: number; z: number };

  // Camera

  type CameraConfig = {
    moveSpeed: number;
    lookAheadDistance: number;
    maxPitchUpDeg: number;
    maxPitchDownDeg: number;
  };

  type CameraState = {
    type: CameraType;
    isRunning: boolean;
    reset: boolean;
    freeCamIsTracking: boolean;
    freeCamIsFocusing: boolean;
    freeCamIsDefocusing: boolean;
    freeCamIsInFocus: boolean;
    target: {
      type: CameraTargetType;
      playerObject: mod.Player | null;
      trackingActive: boolean;
      previousTargetPlayerObject: mod.Player | null;
    };
  };

  // Free Cam Player Tracking

  type TrackedPlayerState = {
    previousTrackedPlayerPos: V3 | null;
    previousTrackedPlayerPosWasZero: boolean | null;
  };

  type FreeCamTrackedPlayerState = TrackedPlayerState & {
    smoothedTrackedPlayerY: number | null;
  };

  // Path Point

  type PathPoint = {
    uniqueId: number;
    orderId: number;
    pos: V3;
    playerPosY: number;
    worldIconName: string;
    selectionType: PointSelectionType;
    parentId?: number;
  };

  type PathPointConfig = {
    defaultColor: mod.Vector;
    hoverColor: mod.Vector;
    menuDefaultColor: mod.Vector;
    menuHoverColor: mod.Vector;
    selectedColor: mod.Vector;
    defaultIcon: mod.WorldIconImages;
    hoverIcon: mod.WorldIconImages;
  };

  type PathPointState = {
    locked: boolean;
    inSelection: boolean;
    isMoving: boolean;
    previousAimedPoint: PathPoint | null;
  };

  // Path

  type PathConfig = {
    cornerRadius: number;
    samplesPerCorner: number;
  };

  type PathState = {
    points: PathPoint[];
    menuPoints: PathPoint[];
  };

  // VFX Loop

  type VFXSpawnEntry = {
    vfx: mod.RuntimeSpawn_Common;
    weight: number;
    minDistance: number;
  };

  type VFXConfig = {
    radius: number;
    spawnChance: number;
    checkInterval: number;
  };

  type VFXState = {
    isRunning: boolean;
    previousCheckPos: V3 | null;
    inventory: VFXSpawnEntry[];
  };

  // UI (Path Point Info)

  type TrackedInfoUIRow = {
    id: TrackedPathPointRowId;
    key: PCT_UI.Text;
    value: PCT_UI.Text;
    lastRenderedValue: number | boolean | V3 | mod.Player | null;
  };

  type TrackedPathPointData = {
    cameraSpeed: number;
    maxPitchUpDeg: number;
    maxPitchDownDeg: number;
    cornerRadius: number;
    lookAheadDistance: number;
    cameraTargetType: CameraTargetType;
    cameraTarget: mod.Player | null;
  };

  type TrackedPathPointRowId = keyof TrackedPathPointData;

  type TrackedPathPointRowSchema = {
    id: TrackedPathPointRowId;
    key: string;
    step: number;
    min?: number;
    max?: number;
  };

  // Player State

  type PlayerUI = {
    selectionUI: {
      root?: PCT_UI.Container | null;
      buttons?: PCT_UI.Button[] | null;
      trackedInfo?: TrackedInfoUIRow[] | null;
    };
    targetSelectionUI: {
      root?: PCT_UI.Container | null;
      playerLabel?: PCT_UI.Text | null;
      playerCountInfo?: PCT_UI.Text | null;
      playerStats?: PCT_UI.Text | null;
      lastRenderedKills?: number | null;
      lastRenderedDeaths?: number | null;
      lastRenderedTargetId?: number | null;
    };
    directorCodeEntryUI: {
      root?: PCT_UI.Container | null;
      digitButtons?: PCT_UI.Button[] | null;
      inputEnabled?: boolean;
    };
    directorMenuUI: {
      root?: PCT_UI.Container | null;
    };
  };

  type PlayerActionStateBool = {
    isCrouching: boolean;
    isFiring: boolean;
    isProne: boolean;
    isJumping: boolean;
    isInteracting: boolean;
  };

  type DirectorState = {
    actionState: PlayerActionStateBool;
  };

  // Config

  export type Config = {
    uiPrefix: string;
    cameraConfig: CameraConfig;
    pathPointConfig: PathPointConfig;
    pathConfig: PathConfig;
    vfxConfig: VFXConfig;
  };

  /************************
   * Private State
   *************************/

  let _fixedCameraId: number;
  let _directorPasscode: string;
  let _showPlayerNametags: boolean;
  let _config: Config;

  let _directorControlRoomSpawnPos: V3;

  let _cameraState: CameraState;
  let _pathPointState: PathPointState;
  let _pathState: PathState;
  let _vfxState: VFXState;

  let _cameraObject: mod.FixedCamera;

  let _directorInteractPoint: mod.InteractPoint | null;
  let _freeCamInteractPoint: mod.InteractPoint | null;

  let _trackedPathPointInfo: TrackedPathPointData;
  let _trackedPathPointInfoUIRows: TrackedPathPointRowSchema[];

  /************************
   * Private Constants
   *************************/

  const oneTick = 0.033; // 0.033 assuming 30hz; 33ms per tick
  const twoTicks = oneTick * 2;
  const threeTicks = oneTick * 3;

  const rtc = mod.RuntimeSpawn_Common;

  /************************
   * V3 and Vector Wrappers
   *************************/

  const V3 = {
    Create(x: number, y: number, z: number): V3 {
      return { x, y, z };
    },

    Zero(): V3 {
      return V3.Create(0, 0, 0);
    },

    Add(a: V3, b: V3): V3 {
      return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z };
    },

    Sub(a: V3, b: V3): V3 {
      return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
    },

    Scale(a: V3, s: number): V3 {
      return { x: a.x * s, y: a.y * s, z: a.z * s };
    },

    Length(a: V3): number {
      return Math.sqrt(a.x * a.x + a.y * a.y + a.z * a.z);
    },

    Dot(a: V3, b: V3): number {
      return a.x * b.x + a.y * b.y + a.z * b.z;
    },

    Normalize(a: V3): V3 {
      const len = V3.Length(a);
      if (len <= 0) {
        return V3.Create(0, 0, 0);
      }
      return V3.Create(a.x / len, a.y / len, a.z / len);
    },

    Lerp(a: number, b: number, t: number): number {
      return a + (b - a) * t;
    },

    DistanceBetween(
      a: V3,
      b: V3,
      distanceType: DistanceType,
      NumberOfDecimals?: number,
    ): { whole: number; fraction: number; full: number } {
      const dx = a.x - b.x;
      const dy = a.y - b.y;
      const dz = a.z - b.z;

      let dist: number;

      if (distanceType === DistanceType.XYZ) {
        dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
      } else {
        dist = Math.sqrt(dx * dx + dz * dz);
      }

      const factor = 10 ** (NumberOfDecimals ?? 2);

      const scaled = Math.round(dist * factor);

      return {
        whole: Math.floor(scaled / factor),
        fraction: scaled % factor,
        full: dist,
      };
    },

    ToVector(v: V3): mod.Vector {
      return mod.CreateVector(v.x, v.y, v.z);
    },
  };

  const Vector = {
    Create(x: number, y: number, z: number): mod.Vector {
      return mod.CreateVector(x, y, z);
    },

    Zero(): mod.Vector {
      return mod.CreateVector(0, 0, 0);
    },

    ToV3(v: mod.Vector): V3 {
      return V3.Create(
        mod.XComponentOf(v),
        mod.YComponentOf(v),
        mod.ZComponentOf(v),
      );
    },
  };

  /************************
   * Public API
   *************************/

  /**
   * Initializes the Portal Camera Toolkit (PCT) module. Should be called at the top of OnGameModeStarted().
   * @param fixedCameraId - The id of the Fixed Camera object created in Godot. This must be a unique id not shared with any other Godot object. The Fixed Camera object in Godot should be positioned at a location reachable for the player to interact with it to activate Director settings.
   * @param directorPasscode - Passcode to become Director when interacting with the Fixed Camera initial position. This should be a numeric string, e.g. "1234".
   * @param showPlayerNametags - Whether to show player nametags. Team 3 of 1 player is required for nametags to show.
   * @param defaultConfig - Optional default configuration for the PCT module.
   */
  export function Initialize(
    fixedCameraId: number,
    directorPasscode: string,
    showPlayerNametags: boolean,
    defaultConfig?: Partial<Config>,
  ): void {
    if (_config) {
      return;
    }
    CreateConfig(
      fixedCameraId,
      directorPasscode,
      showPlayerNametags,
      defaultConfig,
    );

    SpawnDirectorControlRoom();

    _directorInteractPoint = mod.SpawnObject(
      rtc.InteractPoint,
      mod.GetObjectPosition(_cameraObject),
      Vector.Zero(),
    ) as mod.InteractPoint;

    PCT_WIM.init().createIcon(
      "director-panel",
      mod.GetObjectPosition(_cameraObject),
      {
        icon: mod.WorldIconImages.SquadPing,
        iconEnabled: true,
        text: mod.Message("PCT_INTERACT_HERE"),
        textEnabled: true,
        color: PCT_UI.COLORS.RED,
      },
    );
  }

  /************************
   * Config and State Creation
   *************************/

  function CreateConfig(
    fixedCameraId: number,
    directorPasscode: string,
    showPlayerNametags: boolean,
    defaultConfig?: Partial<Config>,
  ) {
    // Core Config

    _fixedCameraId = fixedCameraId;
    _directorPasscode = directorPasscode;
    _showPlayerNametags = showPlayerNametags;

    _config = {
      uiPrefix: defaultConfig?.uiPrefix ?? "pct",
      cameraConfig: {
        moveSpeed: defaultConfig?.cameraConfig?.moveSpeed ?? 6,
        lookAheadDistance: defaultConfig?.cameraConfig?.lookAheadDistance ?? 10,
        maxPitchUpDeg: defaultConfig?.cameraConfig?.maxPitchUpDeg ?? 15,
        maxPitchDownDeg: defaultConfig?.cameraConfig?.maxPitchDownDeg ?? 15,
      },
      pathPointConfig: {
        defaultColor: mod.CreateVector(0, 0.1, 0), // Hex: #002600
        hoverColor: mod.CreateVector(0, 1, 0), // Hex: #00FF00
        menuDefaultColor: mod.CreateVector(0, 0.1, 0), // Hex: #002600
        menuHoverColor: mod.CreateVector(1, 0, 0), // Hex: #FF0000
        selectedColor: mod.CreateVector(1, 0, 0), // Hex: #FF0000
        defaultIcon: mod.WorldIconImages.SquadPing,
        hoverIcon: mod.WorldIconImages.FilledPing,
      },
      pathConfig: {
        cornerRadius: defaultConfig?.pathConfig?.cornerRadius ?? 30,
        samplesPerCorner: defaultConfig?.pathConfig?.samplesPerCorner ?? 16,
      },
      vfxConfig: {
        radius: defaultConfig?.vfxConfig?.radius ?? 50,
        spawnChance: defaultConfig?.vfxConfig?.spawnChance ?? 0.5,
        checkInterval: defaultConfig?.vfxConfig?.checkInterval ?? 0.25,
      },
      ...defaultConfig,
    };

    // State

    _cameraObject = mod.GetFixedCamera(_fixedCameraId);

    _cameraState = {
      type: CameraType.Free,
      isRunning: false,
      reset: false,
      freeCamIsTracking: false,
      freeCamIsFocusing: false,
      freeCamIsDefocusing: false,
      freeCamIsInFocus: false,
      target: {
        type: CameraTargetType.Player,
        playerObject: null,
        trackingActive: false,
        previousTargetPlayerObject: null,
      },
    };

    _pathPointState = {
      locked: false,
      inSelection: false,
      isMoving: false,
      previousAimedPoint: null,
    };

    _pathState = {
      points: [],
      menuPoints: [],
    };

    _vfxState = {
      isRunning: false,
      previousCheckPos: null,
      inventory: [
        {
          vfx: rtc.FX_Gadget_C4_Explosives_Detonation,
          weight: 15,
          minDistance: 5,
        },
        {
          vfx: rtc.FX_ArtilleryStrike_Explosion_GS,
          weight: 10,
          minDistance: 10,
        },
        {
          vfx: rtc.FX_Autocannon_30mm_AP_Hit_GS,
          weight: 15,
          minDistance: 2,
        },
        {
          vfx: rtc.FX_CAP_AmbWar_Rocket_Strike,
          weight: 8,
          minDistance: 40,
        },
        {
          vfx: rtc.FX_Carrier_Explosion_Dist,
          weight: 5,
          minDistance: 100,
        },
        {
          vfx: rtc.FX_CivCar_SUV_Explosion,
          weight: 10,
          minDistance: 10,
        },
        {
          vfx: rtc.FX_Gadget_AirburstLauncher_Detonation,
          weight: 10,
          minDistance: 2,
        },
        {
          vfx: rtc.FX_Gadget_SmokeBarrage_Cluster_Det,
          weight: 5,
          minDistance: 2,
        },
        {
          vfx: rtc.FX_Gadget_SupplyDrop_Destruction,
          weight: 50,
          minDistance: 1,
        },
        {
          vfx: rtc.FX_Grenade_Fragmentation_ImpactGrenade_Detonation,
          weight: 10,
          minDistance: 2,
        },
        {
          vfx: rtc.FX_LoadoutCrate_AirSpawn,
          weight: 15,
          minDistance: 10,
        },
        {
          vfx: rtc.FX_Missile_MBTLAW_Hit,
          weight: 5,
          minDistance: 15,
        },
      ],
    };

    // UI

    _trackedPathPointInfo = {
      cameraSpeed: _config.cameraConfig.moveSpeed,
      maxPitchUpDeg: _config.cameraConfig.maxPitchUpDeg,
      maxPitchDownDeg: _config.cameraConfig.maxPitchDownDeg,
      cornerRadius: _config.pathConfig.cornerRadius,
      lookAheadDistance: _config.cameraConfig.lookAheadDistance,
      cameraTargetType: _cameraState.target.type,
      cameraTarget: _cameraState.target.playerObject,
    };

    _trackedPathPointInfoUIRows = [
      {
        id: "cameraSpeed",
        key: "TRACKED_CAMERA_SPEED",
        step: 1,
        min: 0,
        max: 30,
      },
      {
        id: "maxPitchUpDeg",
        key: "TRACKED_MAX_PITCH_UP",
        step: 5,
        min: 0,
        max: 90,
      },
      {
        id: "maxPitchDownDeg",
        key: "TRACKED_MAX_PITCH_DOWN",
        step: 5,
        min: 0,
        max: 90,
      },
      {
        id: "cornerRadius",
        key: "TRACKED_CORNER_RADIUS",
        step: 5,
        min: 0,
        max: 100,
      },
      {
        id: "lookAheadDistance",
        key: "TRACKED_LOOK_AHEAD_DISTANCE",
        step: 1,
        min: 1,
        max: 20,
      },
      {
        id: "cameraTargetType",
        key: "TRACKED_CAMERA_TARGET_TYPE",
        step: 1,
        min: 0,
        max: Object.keys(CameraTargetType).length / 2 - 1,
      },
      { id: "cameraTarget", key: "TRACKED_CAMERA_TARGET", step: 1, min: 0 },
    ];
  }

  function SpawnDirectorControlRoom(): number[] {
    const roomCenterPos = V3.Create(22, 0, 22); // TODO: Per map for water maps
    _directorControlRoomSpawnPos = roomCenterPos;

    const room = {
      size: 0.005,
      wallHeight: 6.4,
      wallFaceOffsetX: 0.94,
      wallFaceOffsetZ: 0.3,
      wallOverlap: 0.5,

      floor: {
        minX: 0.0,
        maxX: 5.0,
        maxY: 0.0,
        minZ: -3.56,
        maxZ: 0.0,
      },

      ceiling: {
        minX: -0.01,
        maxX: 18.01,
        minY: -0.01,
        minZ: -0.01,
        maxZ: 10.25,
      },
    };

    const halfInterior = room.size / 2;

    const coverSize = Math.max(
      room.size + room.wallFaceOffsetX * 2,
      room.size + room.wallFaceOffsetZ * 2,
    );

    const floorUniformScale = Math.max(
      coverSize / (room.floor.maxX - room.floor.minX),
      coverSize / (room.floor.maxZ - room.floor.minZ),
    );

    const ceilingUniformScale = Math.max(
      coverSize / (room.ceiling.maxX - room.ceiling.minX),
      coverSize / (room.ceiling.maxZ - room.ceiling.minZ),
    );

    const floorCenterLocalX = (room.floor.minX + room.floor.maxX) / 2;
    const floorCenterLocalZ = (room.floor.minZ + room.floor.maxZ) / 2;
    const ceilingCenterLocalX = (room.ceiling.minX + room.ceiling.maxX) / 2;
    const ceilingCenterLocalZ = (room.ceiling.minZ + room.ceiling.maxZ) / 2;

    const leftX = roomCenterPos.x - halfInterior;
    const rightX = roomCenterPos.x + halfInterior;
    const frontZ = roomCenterPos.z + halfInterior;
    const backZ = roomCenterPos.z - halfInterior;

    const spawned: number[] = [];

    function SpawnObject(
      rtc: mod.RuntimeSpawn_Common,
      pos: V3,
      rot: V3,
      scale?: { uniformScale?: number; nonUniformScale?: V3 },
    ): number {
      if (scale?.nonUniformScale) {
        return mod.SpawnObject(
          rtc,
          mod.CreateVector(pos.x, pos.y, pos.z),
          mod.CreateVector(rot.x, rot.y, rot.z),
          mod.CreateVector(
            scale.nonUniformScale.x,
            scale.nonUniformScale.y,
            scale.nonUniformScale.z,
          ),
        ) as number;
      }

      if (scale?.uniformScale !== undefined) {
        return mod.SpawnObject(
          rtc,
          mod.CreateVector(pos.x, pos.y, pos.z),
          mod.CreateVector(rot.x, rot.y, rot.z),
          mod.CreateVector(
            scale.uniformScale,
            scale.uniformScale,
            scale.uniformScale,
          ),
        ) as number;
      }

      return mod.SpawnObject(
        rtc,
        mod.CreateVector(pos.x, pos.y, pos.z),
        mod.CreateVector(rot.x, rot.y, rot.z),
      ) as number;
    }

    const walls = [
      {
        pos: V3.Create(
          leftX - room.wallOverlap,
          roomCenterPos.y,
          frontZ + room.wallFaceOffsetZ,
        ),
        rot: V3.Create(0, 0, 0),
      },
      {
        pos: V3.Create(
          rightX + room.wallOverlap,
          roomCenterPos.y,
          backZ - room.wallFaceOffsetZ,
        ),
        rot: V3.Create(0, Math.PI, 0),
      },
      {
        pos: V3.Create(
          leftX - room.wallFaceOffsetX,
          roomCenterPos.y,
          frontZ + room.wallOverlap,
        ),
        rot: V3.Create(0, Math.PI / 2, 0),
      },
      {
        pos: V3.Create(
          rightX + room.wallFaceOffsetX,
          roomCenterPos.y,
          backZ - room.wallOverlap,
        ),
        rot: V3.Create(0, -Math.PI / 2, 0),
      },
    ];

    for (const wall of walls) {
      spawned.push(
        SpawnObject(rtc.FiringRange_Wall_2048_01, wall.pos, wall.rot),
      );
    }

    spawned.push(
      SpawnObject(
        rtc.FiringRange_Floor_A,
        V3.Create(
          roomCenterPos.x - floorCenterLocalX * floorUniformScale,
          roomCenterPos.y - room.floor.maxY * floorUniformScale,
          roomCenterPos.z - floorCenterLocalZ * floorUniformScale,
        ),
        V3.Create(0, 0, 0),
        { uniformScale: floorUniformScale },
      ),
    );

    spawned.push(
      SpawnObject(
        rtc.FiringRange_Ceiling_02,
        V3.Create(
          roomCenterPos.x - ceilingCenterLocalX * ceilingUniformScale,
          roomCenterPos.y -
            room.ceiling.minY * (ceilingUniformScale + 1) +
            room.wallHeight,
          roomCenterPos.z - ceilingCenterLocalZ * ceilingUniformScale,
        ),
        V3.Create(0, 0, 0),
        {
          nonUniformScale: V3.Create(
            ceilingUniformScale,
            ceilingUniformScale + 1,
            ceilingUniformScale,
          ),
        },
      ),
    );

    return spawned;
  }

  /************************
   * Player Class
   *************************/

  class Player {
    private static readonly registry: { [playerId: number]: Player } = {};
    private static assignedDirectorPlayerId: number | null = null;

    public readonly playerId: number;
    public playerObject: mod.Player;
    public isDirector: boolean;
    public enteredDirectorCode: string;
    public ui: PlayerUI;
    public stateBool: PlayerActionStateBool;
    public directorState: DirectorState | null;

    private constructor(playerObject: mod.Player, playerId: number) {
      this.playerId = playerId;
      this.playerObject = playerObject;
      this.isDirector = false;
      this.enteredDirectorCode = "";
      this.directorState = null;
      this.ui = {
        selectionUI: {},
        targetSelectionUI: {},
        directorCodeEntryUI: {},
        directorMenuUI: {},
      };
      this.stateBool = {
        isCrouching: Player.IsCrouching(playerObject),
        isFiring: Player.IsFiring(playerObject),
        isProne: Player.IsProne(playerObject),
        isJumping: Player.IsJumping(playerObject),
        isInteracting: Player.IsInteracting(playerObject),
      };
    }

    public static GetId(player: mod.Player): number | null {
      if (!mod.IsPlayerValid(player)) return null;
      return mod.GetObjId(player);
    }

    public static Get(player: mod.Player): Player | null {
      const pid = Player.GetId(player);

      if (pid === null) {
        PCT_ErrorLogger.New(Player.Get.name, "Player state is invalid", 3);
        return null;
      }

      const existing = Player.registry[pid] ?? null;
      if (existing) {
        existing.playerObject = player;
      }

      return existing;
    }

    public static GetOrCreate(player: mod.Player): Player | null {
      const pid = Player.GetId(player);
      if (pid === null) return null;

      let existing = Player.registry[pid] ?? null;
      if (existing) {
        existing.playerObject = player;
        return existing;
      }

      const created = new Player(player, pid);
      Player.registry[pid] = created;
      return created;
    }

    public static GetById(playerId: number): Player | null {
      return Player.registry[playerId] ?? null;
    }

    public static RemoveById(playerId: number): void {
      const existing = Player.registry[playerId];
      if (!existing) return;

      if (Player.assignedDirectorPlayerId === playerId) {
        Player.assignedDirectorPlayerId = null;
      }

      delete Player.registry[playerId];
    }

    public static HasAssignedDirector(): boolean {
      return Player.assignedDirectorPlayerId !== null;
    }

    public static GetAssignedDirectorPlayerId(): number | null {
      return Player.assignedDirectorPlayerId;
    }

    public static GetBool(
      player: mod.Player,
      state: mod.SoldierStateBool,
    ): boolean {
      if (!mod.IsPlayerValid(player)) return false;
      return mod.GetSoldierState(player, state);
    }

    public static GetVector(
      player: mod.Player,
      state: mod.SoldierStateVector,
    ): V3 {
      if (!mod.IsPlayerValid(player)) return V3.Zero();
      return Vector.ToV3(mod.GetSoldierState(player, state));
    }

    public static GetIsDirector(player: mod.Player): boolean {
      const ps = Player.Get(player);
      return ps ? ps.isDirector : false;
    }

    public static SetIsDirector(player: mod.Player, value: boolean): void {
      const ps = Player.GetOrCreate(player);
      if (!ps) return;

      if (value) {
        const assignedId = Player.assignedDirectorPlayerId;
        if (assignedId !== null && assignedId !== ps.playerId) {
          PCT_ErrorLogger.New(
            Player.SetIsDirector.name,
            "Director is already assigned.",
            2,
          );
          return;
        }
      }

      ps.isDirector = value;

      let msgLabel: string;

      if (value) {
        Player.assignedDirectorPlayerId = ps.playerId;
        msgLabel = "PCT_DIRECTOR_ASSIGNED";

        ps.directorState = {
          actionState: {
            isCrouching: Player.IsCrouching(player),
            isFiring: Player.IsFiring(player),
            isProne: Player.IsProne(player),
            isJumping: Player.IsJumping(player),
            isInteracting: Player.IsInteracting(player),
          },
        };
      } else {
        if (Player.assignedDirectorPlayerId === ps.playerId) {
          Player.assignedDirectorPlayerId = null;
        }

        msgLabel = "PCT_DIRECTOR_UNASSIGNED";
        ps.directorState = null;
      }

      mod.DisplayHighlightedWorldLogMessage(mod.Message(msgLabel, player));
    }

    public static IsAI(player: mod.Player): boolean {
      return Player.GetBool(player, mod.SoldierStateBool.IsAISoldier);
    }

    public static IsAlive(player: mod.Player): boolean {
      return Player.GetBool(player, mod.SoldierStateBool.IsAlive);
    }

    public static IsDead(player: mod.Player): boolean {
      return Player.GetBool(player, mod.SoldierStateBool.IsDead);
    }

    public static IsManDown(player: mod.Player): boolean {
      return Player.GetBool(player, mod.SoldierStateBool.IsManDown);
    }

    public static IsDeployed(player: mod.Player): boolean {
      return (
        Player.IsAlive(player) &&
        !Player.IsDead(player) &&
        !Player.IsManDown(player)
      );
    }

    public static IsInVehicle(player: mod.Player): boolean {
      return (
        Player.IsDeployed(player) && mod.GetPlayerVehicleSeat(player) !== -1
      );
    }

    public static GetPosition(player: mod.Player): V3 {
      return Player.IsDeployed(player)
        ? Player.GetVector(player, mod.SoldierStateVector.GetPosition)
        : V3.Zero();
    }

    public static GetEyePosition(player: mod.Player): V3 {
      return Player.IsDeployed(player)
        ? Player.GetVector(player, mod.SoldierStateVector.EyePosition)
        : V3.Zero();
    }

    public static GetFacingDirection(player: mod.Player): V3 {
      return Player.IsDeployed(player)
        ? Player.GetVector(player, mod.SoldierStateVector.GetFacingDirection)
        : V3.Zero();
    }

    public static GetLinearVelocity(player: mod.Player): V3 {
      return Player.IsDeployed(player)
        ? Player.GetVector(player, mod.SoldierStateVector.GetLinearVelocity)
        : V3.Zero();
    }

    public static IsJumping(player: mod.Player): boolean {
      return (
        Player.IsDeployed(player) &&
        Player.GetBool(player, mod.SoldierStateBool.IsJumping)
      );
    }

    public static IsCrouching(player: mod.Player): boolean {
      return (
        Player.IsDeployed(player) &&
        Player.GetBool(player, mod.SoldierStateBool.IsCrouching)
      );
    }

    public static IsSprinting(player: mod.Player): boolean {
      return (
        Player.IsDeployed(player) &&
        Player.GetBool(player, mod.SoldierStateBool.IsSprinting)
      );
    }

    public static IsProne(player: mod.Player): boolean {
      return (
        Player.IsDeployed(player) &&
        Player.GetBool(player, mod.SoldierStateBool.IsProne)
      );
    }

    public static IsFiring(player: mod.Player): boolean {
      return (
        Player.IsDeployed(player) &&
        Player.GetBool(player, mod.SoldierStateBool.IsFiring)
      );
    }

    public static IsInteracting(player: mod.Player): boolean {
      return (
        Player.IsDeployed(player) &&
        Player.GetBool(player, mod.SoldierStateBool.IsInteracting)
      );
    }
  }

  async function InitializeDirectorChecks(
    dirPlayer: mod.Player,
  ): Promise<void> {
    const ps = Player.GetOrCreate(dirPlayer);
    if (!ps) return;

    while (mod.IsPlayerValid(dirPlayer) && Player.GetIsDirector(dirPlayer)) {
      if (!Player.IsDeployed(dirPlayer)) {
        ps.stateBool.isJumping = false;
        await mod.Wait(1);
        continue;
      }

      await mod.Wait(oneTick);

      const isJumping = Player.IsJumping(dirPlayer);

      if (isJumping && ps.stateBool.isJumping === false) {
        ps.stateBool.isJumping = true;
        PlayerTracking.InitNextTarget(dirPlayer);
      }

      if (!isJumping && ps.stateBool.isJumping === true) {
        ps.stateBool.isJumping = false;
      }

      TargetSelectionUI.Refresh(dirPlayer);
    }
  }

  namespace PlayerTracking {
    export function InitNextTarget(dirPlayer: mod.Player): void {
      if (_cameraState.isRunning && _cameraState.type === CameraType.Free) {
        const currentTarget = _cameraState.target.playerObject;

        if (_cameraState.freeCamIsTracking) {
          if (CurrentTargetIsValid()) {
            _cameraState.target.previousTargetPlayerObject =
              _cameraState.target.playerObject;
          }

          FindNextTarget(currentTarget);

          _cameraState.freeCamIsFocusing = true;
          _cameraState.freeCamIsDefocusing = false;
        } else {
          let resumedPreviousTarget = false;

          if (
            PreviousTargetIsValid() &&
            Player.IsDeployed(_cameraState.target.previousTargetPlayerObject!)
          ) {
            _cameraState.target.playerObject =
              _cameraState.target.previousTargetPlayerObject;
            resumedPreviousTarget = true;
          } else {
            FindNextTarget(currentTarget);

            resumedPreviousTarget = CurrentTargetIsValid();
          }

          if (resumedPreviousTarget) {
            _cameraState.freeCamIsTracking = true;
            _cameraState.freeCamIsFocusing = true;
            _cameraState.freeCamIsDefocusing = false;
          }
        }

        TargetSelectionUI.Refresh(dirPlayer);
      }
    }

    export function FindNextTarget(currentTarget: mod.Player | null): void {
      let nextTarget: mod.Player | null = null;

      if (currentTarget === null) {
        let firstOtherPlayer: mod.Player | null = null;
        const allPlayers = mod.AllPlayers();
        const allPlayersCount = mod.CountOf(allPlayers);

        for (let i = 0; i < allPlayersCount; i++) {
          const p = mod.ValueInArray(allPlayers, i) as mod.Player | null;
          if (!p || !mod.IsPlayerValid(p) || !Player.IsDeployed(p)) continue;
          //if (mod.Equals(p, DIRECTOR_PLAYER)) continue;

          firstOtherPlayer = p;
          break;
        }

        _cameraState.target.playerObject = firstOtherPlayer;
        currentTarget = firstOtherPlayer;
        SyncTargetPlayerInfo();
      }

      const currentPlayerIndex = GetTargetPlayerIndex(
        currentTarget as mod.Player,
      );
      const allPlayersCount = mod.CountOf(mod.AllPlayers());

      const nextValue = currentPlayerIndex + 1;
      const finalNextValue =
        ((nextValue % allPlayersCount) + allPlayersCount) % allPlayersCount;

      for (let step = 0; step < allPlayersCount; step++) {
        const index = (finalNextValue + step) % allPlayersCount;
        const potentialTarget = mod.ValueInArray(
          mod.AllPlayers(),
          index,
        ) as mod.Player | null;
        if (
          !potentialTarget ||
          !mod.IsPlayerValid(potentialTarget) ||
          !Player.IsDeployed(potentialTarget)
        )
          continue;
        if (mod.Equals(potentialTarget, currentTarget)) continue;

        nextTarget = potentialTarget;
        break;
      }

      if (nextTarget) {
        _cameraState.target.playerObject = nextTarget;
        SyncTargetPlayerInfo();
      }
    }

    export function SyncTargetPlayerInfo(): void {
      if (!CurrentTargetIsValid()) {
        _trackedPathPointInfo.cameraTarget = null;
        return;
      }
      _trackedPathPointInfo.cameraTarget = _cameraState.target.playerObject;
    }

    export function GetTargetPlayerIndex(targetPlayer: mod.Player): number {
      const allPlayers = mod.AllPlayers();
      const count = mod.CountOf(allPlayers);

      for (let i = 0; i < count; i++) {
        const currentPlayer = mod.ValueInArray(allPlayers, i) as mod.Player;

        if (mod.Equals(currentPlayer, targetPlayer)) {
          return i;
        }
      }

      return -1;
    }

    export function GetDeployedPlayersCount(): number {
      let count = 0;
      const allPlayers = mod.AllPlayers();
      const allPlayersCount = mod.CountOf(allPlayers);
      for (let i = 0; i < allPlayersCount; i++) {
        const p = mod.ValueInArray(allPlayers, i) as mod.Player | null;
        if (!p || !mod.IsPlayerValid(p) || !Player.IsDeployed(p)) continue;
        count++;
      }
      return count;
    }

    function GetTargetPosition(player: mod.Player): V3 {
      if (!Player.IsDeployed(player)) {
        return V3.Zero();
      }

      /*if (mod.GetPlayerVehicleSeat(player) !== -1) {
        return Vector.ToV3(
          mod.GetVehicleState(
            mod.GetVehicleFromPlayer(player),
            mod.VehicleStateVector.VehiclePosition,
          ),
        );
      }*/

      return Player.GetEyePosition(player);
    }

    function GetFacingDirection(player: mod.Player): V3 {
      if (!Player.IsDeployed(player)) {
        return V3.Zero();
      }

      /*if (mod.GetPlayerVehicleSeat(player) !== -1) {
        return Vector.ToV3(
          mod.GetVehicleState(
            mod.GetVehicleFromPlayer(player),
            mod.VehicleStateVector.FacingDirection,
          ),
        );
      }*/

      return Player.GetFacingDirection(player);
    }

    function GetPosition(
      player: mod.Player,
      state: TrackedPlayerState,
    ): { effectivePos: V3 | null; isZeroVec: boolean } | null {
      if (!CurrentTargetIsValid()) return null;

      const trackedPlayerPos = GetTargetPosition(
        _cameraState.target.playerObject as mod.Player,
      );

      const isZeroVec =
        trackedPlayerPos.x === 0 &&
        trackedPlayerPos.y === 0 &&
        trackedPlayerPos.z === 0;

      const effectivePos = isZeroVec
        ? state.previousTrackedPlayerPos
        : trackedPlayerPos;

      if (state.previousTrackedPlayerPosWasZero !== isZeroVec) {
        //PCT_RefreshPlayerUI(player);
      }

      state.previousTrackedPlayerPosWasZero = isZeroVec;

      if (!isZeroVec) {
        state.previousTrackedPlayerPos = trackedPlayerPos;
      }

      return { effectivePos, isZeroVec };
    }

    export function GetFollowTarget(
      trackedPlayerPos: V3,
      trackedPlayer: mod.Player,
      backDistance: number,
      heightOffset: number,
      pitchOffsetRad: number,
      minPitch: number,
      maxPitch: number,
    ): { pos: V3; rot: V3 } {
      const facing = GetFacingDirection(trackedPlayer);
      const flatFacing = V3.Normalize(V3.Create(facing.x, 0, facing.z));

      const pos = V3.Create(
        trackedPlayerPos.x - flatFacing.x * backDistance,
        trackedPlayerPos.y + heightOffset,
        trackedPlayerPos.z - flatFacing.z * backDistance,
      );

      const yaw = YawTowards(pos, trackedPlayerPos);
      const pitch = Clamp(
        PitchTowards(pos, trackedPlayerPos) - pitchOffsetRad,
        minPitch,
        maxPitch,
      );

      return {
        pos,
        rot: V3.Create(pitch, yaw, 0),
      };
    }

    export function GetPositionWithSmoothedY(
      player: mod.Player,
      state: FreeCamTrackedPlayerState,
      ySmoothing: number,
    ): V3 | null {
      const tracked = GetPosition(player, state);
      if (!tracked?.effectivePos) return null;

      state.smoothedTrackedPlayerY =
        state.smoothedTrackedPlayerY === null || tracked.isZeroVec
          ? tracked.effectivePos.y
          : V3.Lerp(
              state.smoothedTrackedPlayerY,
              tracked.effectivePos.y,
              ySmoothing,
            );

      return V3.Create(
        tracked.effectivePos.x,
        state.smoothedTrackedPlayerY,
        tracked.effectivePos.z,
      );
    }

    export function CurrentTargetIsValid(): boolean {
      return (
        _cameraState.target.type === CameraTargetType.Player &&
        _cameraState.target.playerObject !== null &&
        mod.IsPlayerValid(_cameraState.target.playerObject)
      );
    }

    export function PreviousTargetIsValid(): boolean {
      return (
        _cameraState.target.type === CameraTargetType.Player &&
        _cameraState.target.previousTargetPlayerObject !== null &&
        mod.IsPlayerValid(_cameraState.target.previousTargetPlayerObject)
      );
    }
  }

  /************************
   * Math Helpers
   *************************/

  function YawTowards(from: V3, to: V3): number {
    const dx = to.x - from.x;
    const dz = to.z - from.z;

    return Math.atan2(dx, dz); // radians
  }

  function PitchTowards(from: V3, to: V3): number {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const dz = to.z - from.z;

    const horizontalDist = Math.max(Math.sqrt(dx * dx + dz * dz), 0.0001);
    return -Math.atan2(dy, horizontalDist);
  }

  function Clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
  }

  function DegToRad(degrees: number): number {
    return (degrees * Math.PI) / 180;
  }

  function NormalizeAngleRad(angle: number): number {
    let a = angle;
    const twoPi = Math.PI * 2;

    while (a > Math.PI) a -= twoPi;
    while (a < -Math.PI) a += twoPi;

    return a;
  }

  function LerpAngleRad(a: number, b: number, t: number): number {
    const delta = NormalizeAngleRad(b - a);
    return NormalizeAngleRad(a + delta * t);
  }

  /************************
   * Camera Helpers
   *************************/

  function SetCameraTransform(
    cam: mod.FixedCamera,
    pos: V3,
    pitch: number,
    yaw: number,
  ): void {
    mod.SetObjectTransform(
      cam,
      mod.CreateTransform(
        mod.CreateVector(pos.x, pos.y, pos.z),
        mod.CreateVector(pitch, yaw, 0),
      ),
    );
  }

  /************************
   * Camera Initialization
   *************************/

  async function StartCamera(player: mod.Player, points: V3[]): Promise<void> {
    const ps = Player.GetOrCreate(player);
    if (ps === null) return;

    if (_cameraState.type === CameraType.Point) {
      if (points.length === 0) return;

      if (points.length === 1) {
        //await PCT_MoveCamera_Stationary(player, points); WORK IN PROGRESS
      } else if (points.length >= 2) {
        //await PCT_MoveCamera_Path(player, points); WORK IN PROGRESS
      }
    } else if (_cameraState.type === CameraType.Free) {
      mod.EnableInputRestriction(player, mod.RestrictedInputs.Prone, true);
      //mod.EnableInputRestriction(dp, mod.RestrictedInputs.CameraPitch, true);
      mod.EnableInputRestriction(player, mod.RestrictedInputs.CycleFire, true);
      mod.EnableInputRestriction(
        player,
        mod.RestrictedInputs.CyclePrimary,
        true,
      );
      mod.EnableInputRestriction(player, mod.RestrictedInputs.Reload, true);
      mod.EnableInputRestriction(
        player,
        mod.RestrictedInputs.SelectMelee,
        true,
      );
      mod.EnableInputRestriction(
        player,
        mod.RestrictedInputs.SelectThrowable,
        true,
      );
      mod.EnableInputRestriction(
        player,
        mod.RestrictedInputs.SelectSecondary,
        true,
      );
      mod.EnableInputRestriction(
        player,
        mod.RestrictedInputs.SelectPrimary,
        true,
      );
      mod.EnableInputRestriction(
        player,
        mod.RestrictedInputs.SelectOpenGadget,
        true,
      );
      mod.EnableInputRestriction(player, mod.RestrictedInputs.FireWeapon, true);
      mod.EnableInputRestriction(
        player,
        mod.RestrictedInputs.SelectCharacterGadget,
        true,
      );

      await mod.Wait(threeTicks);

      _freeCamInteractPoint = mod.SpawnObject(
        rtc.InteractPoint,
        V3.ToVector(_directorControlRoomSpawnPos),
        Vector.Zero(),
      ) as mod.InteractPoint;

      mod.Teleport(player, V3.ToVector(_directorControlRoomSpawnPos), 0);

      mod.EnableInputRestriction(player, mod.RestrictedInputs.Prone, false);

      {
        //DEBUG ONLY - TODO: REMOVE
        const schema = _trackedPathPointInfoUIRows.find(
          (row) => row.id === "cameraTargetType",
        );
        if (!schema) return;

        //PCT_AdjustTrackedPathPointValue(schema.id, -schema.step);
        //PCT_RefreshPlayerUI(player);
      }

      await StartFreeCamera(player);
    }
  }

  /************************
   * Camera Type: Free
   *************************/

  async function StartFreeCamera(dirPlayer: mod.Player): Promise<void> {
    const ps = Player.GetOrCreate(dirPlayer);
    if (ps === null) return;

    _cameraState.freeCamIsTracking = true;
    _cameraState.target.type = CameraTargetType.Player;

    if (_cameraState.target.playerObject === null) {
      PlayerTracking.FindNextTarget(null);
    }

    if (PlayerTracking.CurrentTargetIsValid()) {
      _cameraState.target.previousTargetPlayerObject =
        _cameraState.target.playerObject;
    }

    const cam = _cameraObject;
    const playerPos = Player.GetPosition(dirPlayer);
    const playerFacing = Player.GetFacingDirection(dirPlayer);
    const camStartPos = V3.Add(playerPos, V3.Scale(playerFacing, -10));
    camStartPos.y += 40;

    const camParamsRefreshTicks = 10;

    const trackedPlayerPitchOffsetRad = DegToRad(15);
    const trackedRotationSmoothingYaw = 0.12;
    const trackedRotationSmoothingPitch = 0.12;
    const trackedPlayerYSmoothing = 0.08;

    const focusPositionSmoothing = 0.1;
    const focusRotationSmoothing = 0.1;
    const focusArriveDistance = 0.01;
    const focusArriveAngle = 0.01;
    const focusPullbackDistance = 2;
    const focusHeightOffset = 0.9;

    const focusedInputSideOffsetMax = 0.9;
    const focusedInputForwardOffsetMax = 0.7;
    const focusedInputSideSmoothing = 0.12;
    const focusedInputForwardSmoothing = 0.12;

    const freeMoveRotationSmoothing = 0.18;
    const freeMoveForwardSmoothing = 0.12;
    const freeMoveStrafeSmoothing = 0.12;

    const minPitch = -DegToRad(89);
    const maxPitch = DegToRad(89);

    let cachedMinPitch = minPitch;
    let cachedMaxPitch = maxPitch;
    let tickCounter = 0;

    const trackedState: FreeCamTrackedPlayerState = {
      previousTrackedPlayerPos: null,
      previousTrackedPlayerPosWasZero: null,
      smoothedTrackedPlayerY: null,
    };

    let smoothedTrackedYaw: number | null = null;
    let smoothedTrackedPitch: number | null = null;

    let focusTransitionTargetPos: V3 | null = null;
    let focusTransitionTargetRot: V3 | null = null;

    let focusedInputSideOffsetCurrent = 0;
    let focusedInputForwardOffsetCurrent = 0;

    let freeMoveSmoothedForwardAmount = 0;
    let freeMoveSmoothedRightAmount = 0;
    let freeMoveSmoothedYaw: number | null = null;
    let freeMoveSmoothedPitch: number | null = null;

    let camStartYaw = YawTowards(camStartPos, playerPos);
    let camStartPitch = 0;

    const initialTrackedPlayerPos = PlayerTracking.GetPositionWithSmoothedY(
      dirPlayer,
      trackedState,
      trackedPlayerYSmoothing,
    );

    if (initialTrackedPlayerPos) {
      camStartYaw = YawTowards(camStartPos, initialTrackedPlayerPos);

      camStartPitch = Clamp(
        PitchTowards(camStartPos, initialTrackedPlayerPos) -
          trackedPlayerPitchOffsetRad,
        cachedMinPitch,
        cachedMaxPitch,
      );
    }

    smoothedTrackedYaw = camStartYaw;
    smoothedTrackedPitch = camStartPitch;

    SetCameraTransform(cam, camStartPos, camStartPitch, camStartYaw);

    mod.SetSpawnMode(mod.SpawnModes.Spectating);
    mod.SetCameraTypeForPlayer(dirPlayer, mod.Cameras.Fixed, _fixedCameraId);

    await mod.Wait(threeTicks);

    _cameraState.isRunning = true;
    //PCT_SpawnVFXAroundCamera(cam);

    while (_cameraState.isRunning === true && _cameraState.reset === false) {
      await mod.Wait(oneTick);

      if (!Player.GetOrCreate(dirPlayer)) {
        _cameraState.isRunning = false; //Todo: Actually remove director/reset state in GetValidDirectorState instead of just stopping the camera, and handle that case properly here instead of just breaking out of the loop
        break;
      }

      if (tickCounter % camParamsRefreshTicks === 0) {
        cachedMinPitch = -DegToRad(89);
        cachedMaxPitch = DegToRad(89);
      }
      tickCounter++;

      const playerFacingDirection = Player.GetFacingDirection(dirPlayer);
      const playerLinearVelocity = Player.GetLinearVelocity(dirPlayer);
      const camPos = Vector.ToV3(mod.GetObjectPosition(cam));

      let effectiveTrackedPlayerPosForLoop: V3 | null = null;

      if (_cameraState.freeCamIsTracking) {
        effectiveTrackedPlayerPosForLoop =
          PlayerTracking.GetPositionWithSmoothedY(
            dirPlayer,
            trackedState,
            trackedPlayerYSmoothing,
          );

        if (
          effectiveTrackedPlayerPosForLoop &&
          PlayerTracking.CurrentTargetIsValid()
        ) {
          const trackedPlayer = _cameraState.target.playerObject as mod.Player;

          if (_cameraState.freeCamIsFocusing) {
            const focusTarget = PlayerTracking.GetFollowTarget(
              effectiveTrackedPlayerPosForLoop,
              trackedPlayer,
              focusPullbackDistance,
              focusHeightOffset,
              trackedPlayerPitchOffsetRad,
              cachedMinPitch,
              cachedMaxPitch,
            );

            focusTransitionTargetPos = focusTarget.pos;
            focusTransitionTargetRot = focusTarget.rot;
          }

          if (_cameraState.freeCamIsDefocusing) {
            const defocusTarget = PlayerTracking.GetFollowTarget(
              effectiveTrackedPlayerPosForLoop,
              trackedPlayer,
              15,
              12,
              trackedPlayerPitchOffsetRad,
              cachedMinPitch,
              cachedMaxPitch,
            );

            focusTransitionTargetPos = defocusTarget.pos;
            focusTransitionTargetRot = defocusTarget.rot;
          }
        }
      }

      const horizontalVelocity = V3.Create(
        playerLinearVelocity.x,
        0,
        playerLinearVelocity.z,
      );

      const horizontalSpeedSq =
        horizontalVelocity.x * horizontalVelocity.x +
        horizontalVelocity.z * horizontalVelocity.z;

      const minMoveSpeed = 0.05;
      const hasMoveInput = horizontalSpeedSq > minMoveSpeed * minMoveSpeed;

      if (hasMoveInput) {
        if (
          _cameraState.freeCamIsTracking &&
          PlayerTracking.CurrentTargetIsValid()
        ) {
          _cameraState.target.previousTargetPlayerObject =
            _cameraState.target.playerObject;
        }

        _cameraState.freeCamIsTracking = false;

        _cameraState.freeCamIsFocusing = false;
        _cameraState.freeCamIsDefocusing = false;
        _cameraState.freeCamIsInFocus = false;

        focusTransitionTargetPos = null;
        focusTransitionTargetRot = null;
      }

      let inputDirection = V3.Zero();

      if (hasMoveInput) {
        const moveInput = V3.Normalize(horizontalVelocity);

        const horizontalFacing = V3.Normalize(
          V3.Create(playerFacingDirection.x, 0, playerFacingDirection.z),
        );

        const fullForward = V3.Normalize(playerFacingDirection);

        const rightFromFacing = V3.Normalize(
          V3.Create(-horizontalFacing.z, 0, horizontalFacing.x),
        );

        const targetForwardAmount =
          moveInput.x * horizontalFacing.x + moveInput.z * horizontalFacing.z;

        const targetRightAmount =
          moveInput.x * -horizontalFacing.z + moveInput.z * horizontalFacing.x;

        freeMoveSmoothedForwardAmount = V3.Lerp(
          freeMoveSmoothedForwardAmount,
          targetForwardAmount,
          freeMoveForwardSmoothing,
        );

        freeMoveSmoothedRightAmount = V3.Lerp(
          freeMoveSmoothedRightAmount,
          targetRightAmount,
          freeMoveStrafeSmoothing,
        );

        inputDirection = V3.Normalize(
          V3.Add(
            V3.Scale(fullForward, freeMoveSmoothedForwardAmount),
            V3.Scale(rightFromFacing, freeMoveSmoothedRightAmount),
          ),
        );
      } else {
        freeMoveSmoothedForwardAmount = V3.Lerp(
          freeMoveSmoothedForwardAmount,
          0,
          freeMoveForwardSmoothing,
        );

        freeMoveSmoothedRightAmount = V3.Lerp(
          freeMoveSmoothedRightAmount,
          0,
          freeMoveStrafeSmoothing,
        );
      }

      const freeCamSpeed = Player.IsSprinting(dirPlayer)
        ? _config.cameraConfig.moveSpeed * 2
        : _config.cameraConfig.moveSpeed;

      const nextCamPos = V3.Add(
        camPos,
        V3.Scale(inputDirection, freeCamSpeed * oneTick),
      );

      let nextYaw = YawTowards(
        nextCamPos,
        V3.Add(nextCamPos, V3.Scale(playerFacingDirection, 10)),
      );

      let nextPitch = 0;

      if (!_cameraState.freeCamIsTracking) {
        const freeTargetYaw = YawTowards(
          nextCamPos,
          V3.Add(nextCamPos, playerFacingDirection),
        );

        const freeTargetPitch = Clamp(
          PitchTowards(nextCamPos, V3.Add(nextCamPos, playerFacingDirection)),
          cachedMinPitch,
          cachedMaxPitch,
        );

        if (freeMoveSmoothedYaw === null) {
          freeMoveSmoothedYaw = freeTargetYaw;
        } else {
          freeMoveSmoothedYaw = LerpAngleRad(
            freeMoveSmoothedYaw,
            freeTargetYaw,
            freeMoveRotationSmoothing,
          );
        }

        if (freeMoveSmoothedPitch === null) {
          freeMoveSmoothedPitch = freeTargetPitch;
        } else {
          freeMoveSmoothedPitch = LerpAngleRad(
            freeMoveSmoothedPitch,
            freeTargetPitch,
            freeMoveRotationSmoothing,
          );
        }

        nextYaw = freeMoveSmoothedYaw;
        nextPitch = freeMoveSmoothedPitch;
      }

      if (_cameraState.freeCamIsTracking && effectiveTrackedPlayerPosForLoop) {
        freeMoveSmoothedYaw = null;
        freeMoveSmoothedPitch = null;

        const targetYaw = YawTowards(
          nextCamPos,
          effectiveTrackedPlayerPosForLoop,
        );

        const targetPitch = Clamp(
          PitchTowards(nextCamPos, effectiveTrackedPlayerPosForLoop) -
            trackedPlayerPitchOffsetRad,
          cachedMinPitch,
          cachedMaxPitch,
        );

        if (smoothedTrackedYaw === null) {
          smoothedTrackedYaw = targetYaw;
        } else {
          smoothedTrackedYaw = LerpAngleRad(
            smoothedTrackedYaw,
            targetYaw,
            trackedRotationSmoothingYaw,
          );
        }

        if (smoothedTrackedPitch === null) {
          smoothedTrackedPitch = targetPitch;
        } else {
          smoothedTrackedPitch = LerpAngleRad(
            smoothedTrackedPitch,
            targetPitch,
            trackedRotationSmoothingPitch,
          );
        }

        nextYaw = smoothedTrackedYaw;
        nextPitch = smoothedTrackedPitch;
      } else {
        smoothedTrackedYaw = null;
        smoothedTrackedPitch = null;
      }

      let finalCamPos = nextCamPos;
      let finalCamRot = V3.Create(nextPitch, nextYaw, 0);

      if (
        _cameraState.freeCamIsTracking &&
        _cameraState.freeCamIsInFocus &&
        effectiveTrackedPlayerPosForLoop &&
        PlayerTracking.CurrentTargetIsValid()
      ) {
        const shoulderForwardBias = 0.35;

        const trackedFacingRaw = Player.GetFacingDirection(
          _cameraState.target.playerObject as mod.Player,
        );
        const trackedPlayerFacing = V3.Normalize(
          V3.Create(trackedFacingRaw.x, 0, trackedFacingRaw.z),
        );

        const trackedRight = V3.Create(
          -trackedPlayerFacing.z,
          0,
          trackedPlayerFacing.x,
        );

        let forwardAmount = 0;
        let rightAmount = 0;

        if (horizontalSpeedSq > minMoveSpeed * minMoveSpeed) {
          const moveInput = V3.Normalize(horizontalVelocity);

          forwardAmount =
            moveInput.x * playerFacingDirection.x +
            moveInput.z * playerFacingDirection.z;

          rightAmount =
            moveInput.x * -playerFacingDirection.z +
            moveInput.z * playerFacingDirection.x;
        }

        const targetSideOffset = rightAmount * focusedInputSideOffsetMax;
        const targetForwardOffset =
          forwardAmount * focusedInputForwardOffsetMax +
          Math.abs(rightAmount) * shoulderForwardBias;

        focusedInputSideOffsetCurrent = V3.Lerp(
          focusedInputSideOffsetCurrent,
          targetSideOffset,
          focusedInputSideSmoothing,
        );

        focusedInputForwardOffsetCurrent = V3.Lerp(
          focusedInputForwardOffsetCurrent,
          targetForwardOffset,
          focusedInputForwardSmoothing,
        );

        const baseFocusPos = V3.Create(
          effectiveTrackedPlayerPosForLoop.x -
            trackedPlayerFacing.x * focusPullbackDistance,
          effectiveTrackedPlayerPosForLoop.y + focusHeightOffset,
          effectiveTrackedPlayerPosForLoop.z -
            trackedPlayerFacing.z * focusPullbackDistance,
        );

        const sideOffset = V3.Scale(
          trackedRight,
          focusedInputSideOffsetCurrent,
        );

        const forwardOffset = V3.Scale(
          trackedPlayerFacing,
          focusedInputForwardOffsetCurrent,
        );

        finalCamPos = V3.Add(baseFocusPos, V3.Add(sideOffset, forwardOffset));

        finalCamRot = V3.Create(nextPitch, nextYaw, 0);
      } else {
        focusedInputSideOffsetCurrent = V3.Lerp(
          focusedInputSideOffsetCurrent,
          0,
          focusedInputSideSmoothing,
        );

        focusedInputForwardOffsetCurrent = V3.Lerp(
          focusedInputForwardOffsetCurrent,
          0,
          focusedInputForwardSmoothing,
        );
      }

      if (focusTransitionTargetPos && focusTransitionTargetRot) {
        finalCamPos = V3.Create(
          V3.Lerp(
            nextCamPos.x,
            focusTransitionTargetPos.x,
            focusPositionSmoothing,
          ),
          V3.Lerp(
            nextCamPos.y,
            focusTransitionTargetPos.y,
            focusPositionSmoothing,
          ),
          V3.Lerp(
            nextCamPos.z,
            focusTransitionTargetPos.z,
            focusPositionSmoothing,
          ),
        );

        if (effectiveTrackedPlayerPosForLoop) {
          const transitionTargetYaw = YawTowards(
            finalCamPos,
            effectiveTrackedPlayerPosForLoop,
          );

          const transitionTargetPitch = Clamp(
            PitchTowards(finalCamPos, effectiveTrackedPlayerPosForLoop) -
              trackedPlayerPitchOffsetRad,
            cachedMinPitch,
            cachedMaxPitch,
          );

          finalCamRot = V3.Create(
            LerpAngleRad(
              nextPitch,
              transitionTargetPitch,
              focusRotationSmoothing,
            ),
            LerpAngleRad(nextYaw, transitionTargetYaw, focusRotationSmoothing),
            0,
          );
        } else {
          finalCamRot = V3.Create(
            LerpAngleRad(
              nextPitch,
              focusTransitionTargetRot.x,
              focusRotationSmoothing,
            ),
            LerpAngleRad(
              nextYaw,
              focusTransitionTargetRot.y,
              focusRotationSmoothing,
            ),
            0,
          );
        }

        const arrivedDistance = V3.DistanceBetween(
          finalCamPos,
          focusTransitionTargetPos,
          DistanceType.XZ,
        ).full;
        const arrivedYaw = Math.abs(
          NormalizeAngleRad(finalCamRot.y - focusTransitionTargetRot.y),
        );
        const arrivedPitch = Math.abs(
          NormalizeAngleRad(finalCamRot.x - focusTransitionTargetRot.x),
        );

        if (
          arrivedDistance <= focusArriveDistance &&
          arrivedYaw <= focusArriveAngle &&
          arrivedPitch <= focusArriveAngle
        ) {
          finalCamPos = focusTransitionTargetPos;
          finalCamRot = focusTransitionTargetRot;

          if (_cameraState.freeCamIsFocusing) {
            _cameraState.freeCamIsFocusing = false;
            _cameraState.freeCamIsInFocus = true;
          }

          if (_cameraState.freeCamIsDefocusing) {
            _cameraState.freeCamIsDefocusing = false;
            _cameraState.freeCamIsInFocus = false;
          }

          focusTransitionTargetPos = null;
          focusTransitionTargetRot = null;
        }
      }

      SetCameraTransform(
        _cameraObject,
        finalCamPos,
        finalCamRot.x,
        finalCamRot.y,
      );
    }
  }

  /************************
   * UI
   *************************/

  namespace DirectorCodeEntryUI {
    export function Init(player: mod.Player): void {
      const ps = Player.GetOrCreate(player);
      if (ps === null) return;

      if (Player.HasAssignedDirector()) {
        mod.DisplayHighlightedWorldLogMessage(
          mod.Message("PCT_DIRECTOR_ALREADY_ASSIGNED"),
          player,
        );
        return;
      }

      mod.EnableUIInputMode(true, player);

      if (ps.ui.directorCodeEntryUI.root) {
        ps.enteredDirectorCode = "";
        ps.ui.directorCodeEntryUI.root.show();
        return;
      }

      ps.ui.directorCodeEntryUI.inputEnabled = true;

      const layout = {
        x: 0,
        y: 0,
        width: 400,
        height: 600,
        titleHeight: 60,
        buttonWidth: 90,
        buttonHeight: 70,
        buttonGap: 15,
        keypadStartY: 170,
        closeButtonWidth: 120,
        closeButtonHeight: 50,
      };

      ps.ui.directorCodeEntryUI.root = new PCT_UI.Container(
        {
          anchor: mod.UIAnchor.Center,
          depth: mod.UIDepth.AboveGameUI,
          x: layout.x,
          y: layout.y,
          width: layout.width,
          height: layout.height,
          bgFill: mod.UIBgFill.Blur,
          bgAlpha: 1,
          showOutline: true,
          childrenParams: [
            {
              type: PCT_UI.Type.Container,
              anchor: mod.UIAnchor.TopLeft,
              x: 0,
              y: 0,
              width: layout.width,
              height: layout.height,
              bgFill: mod.UIBgFill.Solid,
              bgAlpha: 0.6,
              bgColor: PCT_UI.COLORS.BLACK,
            },
            {
              type: PCT_UI.Type.Text,
              anchor: mod.UIAnchor.TopCenter,
              x: 0,
              y: 0,
              width: layout.width,
              height: layout.titleHeight,
              message: mod.Message("PCT_ENTER_PASSCODE"),
              textAnchor: mod.UIAnchor.Center,
              textSize: 24,
              textColor: PCT_UI.COLORS.WHITE,
              textAlpha: 1,
            },
          ],
        },
        player,
      );

      const codeLabel = new PCT_UI.Text(
        {
          type: PCT_UI.Type.Text,
          parent: ps.ui.directorCodeEntryUI.root,
          anchor: mod.UIAnchor.TopCenter,
          x: 0,
          y: layout.titleHeight + 10,
          width: layout.width - 80,
          height: layout.titleHeight,
          message: mod.Message(""),
          textAnchor: mod.UIAnchor.Center,
          textSize: 18,
          textColor: PCT_UI.COLORS.WHITE,
          textAlpha: 1,
          bgFill: mod.UIBgFill.Solid,
          bgColor: PCT_UI.COLORS.WHITE,
          bgAlpha: 0.02,
        },
        player,
      );

      new PCT_UI.Button(
        {
          parent: ps.ui.directorCodeEntryUI.root,
          anchor: mod.UIAnchor.BottomCenter,
          x: 0,
          y: layout.closeButtonHeight / 2,
          width: layout.closeButtonWidth,
          height: layout.closeButtonHeight,
          label: {
            message: mod.Message("PCT_CLOSE"),
            textSize: 18,
            textColor: PCT_UI.COLORS.WHITE,
          },
          onClick: async (buttonPlayer: mod.Player) => {
            mod.EnableUIInputMode(false, buttonPlayer);
            DirectorCodeEntryUI.Destroy(mod.GetObjId(buttonPlayer));
          },
        },
        player,
      );

      const digits = [
        { digit: "1", row: 0, col: 0 },
        { digit: "2", row: 0, col: 1 },
        { digit: "3", row: 0, col: 2 },
        { digit: "4", row: 1, col: 0 },
        { digit: "5", row: 1, col: 1 },
        { digit: "6", row: 1, col: 2 },
        { digit: "7", row: 2, col: 0 },
        { digit: "8", row: 2, col: 1 },
        { digit: "9", row: 2, col: 2 },
        { digit: "0", row: 3, col: 1 },
      ];

      const totalRowWidth = layout.buttonWidth * 3 + layout.buttonGap * 2;
      const startX = Math.floor((layout.width - totalRowWidth) / 2);

      for (const entry of digits) {
        const button = CreateDigitButton(player, entry.digit);
        if (button === null) {
          PCT_ErrorLogger.New(
            DirectorCodeEntryUI.Init.name,
            `Failed to create button for digit ${entry.digit}`,
            3,
          );
          DirectorCodeEntryUI.Destroy(mod.GetObjId(player));
          return;
        }

        button.setPosition({
          x: startX + entry.col * (layout.buttonWidth + layout.buttonGap),
          y:
            layout.keypadStartY +
            entry.row * (layout.buttonHeight + layout.buttonGap),
        });

        if (!ps.ui.directorCodeEntryUI.digitButtons) {
          ps.ui.directorCodeEntryUI.digitButtons = [button];
        } else {
          ps.ui.directorCodeEntryUI.digitButtons.push(button);
        }
      }

      async function OnDigitPressed(
        pressPlayer: mod.Player,
        digit: string,
      ): Promise<void> {
        const pps = Player.GetOrCreate(pressPlayer);
        if (pps === null) return;

        const codeUI = pps.ui.directorCodeEntryUI;
        if (!codeUI.root || !codeUI.inputEnabled) return;

        pps.enteredDirectorCode += digit;

        const enteredCode = pps.enteredDirectorCode;
        const passcodeLength = _directorPasscode.length;

        if (enteredCode.length < passcodeLength) {
          const msg =
            Number(enteredCode) === 0
              ? mod.Message("")
              : mod.Message("{}", Number(enteredCode));
          codeLabel.setMessage(msg);
          codeLabel.textColor = PCT_UI.COLORS.WHITE;
          return;
        }

        const isCorrect = enteredCode === _directorPasscode;
        const feedbackColor = isCorrect
          ? PCT_UI.COLORS.GREEN
          : PCT_UI.COLORS.RED;
        const feedbackMessage = isCorrect
          ? mod.Message("PCT_CODE_CORRECT")
          : mod.Message("PCT_CODE_INCORRECT");

        codeUI.inputEnabled = false;
        codeLabel.setMessage(feedbackMessage);
        codeLabel.textColor = feedbackColor;

        for (const button of pps.ui.directorCodeEntryUI.digitButtons || []) {
          button.setColorBase(feedbackColor);
        }

        await mod.Wait(1);

        if (isCorrect) {
          Player.SetIsDirector(player, true);
          InitializeDirectorChecks(player);

          mod.EnableUIInputMode(false, pressPlayer);
          codeUI.root.hide();

          DirectorMenuUI.Init(pressPlayer);
          pps.enteredDirectorCode = "";
          return;
        }

        codeUI.inputEnabled = true;
        pps.enteredDirectorCode = "";
        codeLabel.setMessage(mod.Message(""));

        for (const button of pps.ui.directorCodeEntryUI.digitButtons || []) {
          button.setColorBase(PCT_UI.COLORS.WHITE);
        }
      }

      function CreateDigitButton(
        digitPlayer: mod.Player,
        digit: string,
      ): PCT_UI.Button | null {
        const pps = Player.GetOrCreate(digitPlayer);
        if (pps === null) return null;
        if (!pps.ui.directorCodeEntryUI.root) return null;

        const button = new PCT_UI.Button(
          {
            parent: pps.ui.directorCodeEntryUI.root,
            anchor: mod.UIAnchor.TopLeft,
            x: 0,
            y: 0,
            width: layout.buttonWidth,
            height: layout.buttonHeight,
            label: {
              message: mod.Message("{}", Number(digit)),
              textColor: PCT_UI.COLORS.WHITE,
              textAlpha: 1,
              textSize: 24,
            },
            bgFill: mod.UIBgFill.OutlineThin,
            bgColor: PCT_UI.COLORS.WHITE,
            bgAlpha: 0.8,
            disabledOnClick: true,
            onClick: async () => OnDigitPressed(digitPlayer, digit),
          },
          digitPlayer,
        );

        return button;
      }
    }

    export function Destroy(pid: number): void {
      const ps = Player.GetById(pid);
      if (ps === null) return;
      if (ps.ui.directorCodeEntryUI.root) {
        ps.ui.directorCodeEntryUI.root.destroy();
        ps.ui.directorCodeEntryUI.root = null;
        ps.ui.directorCodeEntryUI.digitButtons = null;
      }

      ps.enteredDirectorCode = "";
    }
  }

  namespace DirectorMenuUI {
    export function Init(player: mod.Player): void {
      const ps = Player.GetOrCreate(player);
      if (ps === null) return;

      mod.EnableUIInputMode(true, player);

      if (ps.ui.directorMenuUI.root) {
        ps.ui.directorMenuUI.root.show();
        return;
      }

      const menuLayout = {
        x: 0,
        y: 0,
        width: 400,
        height: 600,
        padding: 20,
        titleHeight: 50,
        buttonWidth: 360,
        buttonHeight: 50,
      };

      const root = new PCT_UI.Container(
        {
          anchor: mod.UIAnchor.Center,
          depth: mod.UIDepth.AboveGameUI,
          x: menuLayout.x,
          y: menuLayout.y,
          width: menuLayout.width,
          height: menuLayout.height,
          bgFill: mod.UIBgFill.Blur,
          bgAlpha: 1,
          showOutline: true,
          childrenParams: [
            {
              type: PCT_UI.Type.Container,
              anchor: mod.UIAnchor.TopLeft,
              x: 0,
              y: 0,
              width: menuLayout.width,
              height: menuLayout.height,
              bgFill: mod.UIBgFill.Solid,
              bgAlpha: 0.6,
              bgColor: PCT_UI.COLORS.BLACK,
            },
            {
              type: PCT_UI.Type.Text,
              anchor: mod.UIAnchor.TopCenter,
              x: 0,
              y: 0,
              width: menuLayout.width,
              height: 50,
              message: mod.Message("PCT_DIRECTOR_MENU"),
              textAnchor: mod.UIAnchor.Center,
              textSize: 24,
              textColor: PCT_UI.COLORS.WHITE,
              textAlpha: 1,
            },
          ],
        },
        player,
      );

      const menuButtons = [
        {
          label: mod.Message("PCT_FREE_CAMERA_KEY"),
          onClick: async (buttonPlayer: mod.Player) => {
            _cameraState.type = CameraType.Free;
            StartCamera(buttonPlayer, []);
            root.hide();
            mod.EnableUIInputMode(false, buttonPlayer);

            TargetSelectionUI.Init(buttonPlayer);
          },
        },
        /*{
          label: mod.Message("PCT_PATH_CAMERA_KEY"),
          onClick: async (buttonPlayer: mod.Player) => {
            _cameraState.type = CameraType.Point;
            // Todo: Start UI for selecting points
          },
        },
        {
          label: mod.Message("PCT_THIRDPERSON_CAMERA_KEY"),
          onClick: async (buttonPlayer: mod.Player) => {
            _cameraState.type = CameraType.ThirdPerson;
            // Todo: Start UI for selecting points
          },
        },*/
      ];

      for (let i = 0; i < menuButtons.length; i++) {
        const buttonInfo = menuButtons[i];
        const button = CreateMenuButton(buttonInfo);
        button.setPosition({
          x: 0,
          y:
            menuLayout.titleHeight +
            menuLayout.padding +
            i * (menuLayout.buttonHeight + menuLayout.padding),
        });
      }

      function CreateMenuButton(buttonInfo: {
        label: mod.Message;
        onClick: (player: mod.Player) => Promise<void>;
      }): PCT_UI.Button {
        return new PCT_UI.Button({
          parent: root,
          anchor: mod.UIAnchor.TopCenter,
          x: 0,
          y: 0,
          width: menuLayout.buttonWidth,
          height: menuLayout.buttonHeight,
          label: {
            message: buttonInfo.label,
            textColor: PCT_UI.COLORS.WHITE,
            textAlpha: 1,
            textSize: 18,
          },
          bgFill: mod.UIBgFill.OutlineThin,
          bgColor: PCT_UI.COLORS.WHITE,
          bgAlpha: 0.8,
          onClick: () => buttonInfo.onClick(player),
        });
      }
    }

    export function Destroy(pid: number): void {
      const ps = Player.GetById(pid);
      if (ps === null) return;
      if (ps.ui.directorMenuUI.root) {
        ps.ui.directorMenuUI.root.destroy();
        ps.ui.directorMenuUI.root = null;
      }
    }
  }

  namespace TargetSelectionUI {
    export function Init(player: mod.Player): void {
      const ps = Player.GetOrCreate(player);
      if (ps === null) return;

      const layout = {
        x: 0,
        y: 30,
        width: 500,
        height: 60,
        padding: 15,
        buttonSize: 50,
      };

      ps.ui.targetSelectionUI.root = new PCT_UI.Container(
        {
          anchor: mod.UIAnchor.BottomCenter,
          depth: mod.UIDepth.AboveGameUI,
          x: layout.x,
          y: layout.y,
          width: layout.width,
          height: layout.height,
          bgFill: mod.UIBgFill.Blur,
          bgAlpha: 0.8,
          showOutline: true,
          childrenParams: [
            {
              type: PCT_UI.Type.Container,
              anchor: mod.UIAnchor.TopLeft,
              x: 0,
              y: 0,
              width: layout.width,
              height: layout.height,
              bgFill: mod.UIBgFill.Solid,
              bgAlpha: 0.6,
              bgColor: PCT_UI.COLORS.BLACK,
            },
          ],
        },
        player,
      );

      ps.ui.targetSelectionUI.playerLabel = new PCT_UI.Text(
        {
          parent: ps.ui.targetSelectionUI.root,
          anchor: mod.UIAnchor.Center,
          x: 0,
          y: 0,
          width: layout.width,
          height: layout.height,
          message: mod.Message(""),
          textAnchor: mod.UIAnchor.Center,
          textSize: 22,
          textColor: PCT_UI.COLORS.WHITE,
          textAlpha: 0.8,
        },
        player,
      );

      ps.ui.targetSelectionUI.playerStats = new PCT_UI.Text(
        {
          parent: ps.ui.targetSelectionUI.root,
          anchor: mod.UIAnchor.TopLeft,
          x: 10,
          y: 10,
          width: 70,
          height: 10,
          message: mod.Message(""),
          textColor: PCT_UI.COLORS.WHITE,
          textAlpha: 0.8,
          textSize: 14,
          textAnchor: mod.UIAnchor.CenterLeft,
        },
        player,
      );

      ps.ui.targetSelectionUI.playerCountInfo = new PCT_UI.Text(
        {
          parent: ps.ui.targetSelectionUI.root,
          anchor: mod.UIAnchor.TopRight,
          x: 10,
          y: 10,
          width: 10,
          height: 10,
          message: mod.Message(""),
          textColor: PCT_UI.COLORS.WHITE,
          textAlpha: 0.8,
          textSize: 14,
          textAnchor: mod.UIAnchor.CenterRight,
        },
        player,
      );
    }

    export function Refresh(player: mod.Player): void {
      const ps = Player.GetOrCreate(player);
      if (ps === null) return;

      const psui = ps.ui.targetSelectionUI;
      if (
        !psui.root ||
        !psui.playerLabel ||
        !psui.playerCountInfo ||
        !psui.playerStats
      )
        return;

      const playerTarget = _cameraState.target.playerObject as mod.Player;
      if (playerTarget == null) return;

      if (mod.IsPlayerValid(playerTarget) && Player.IsDeployed(playerTarget)) {
        psui.playerLabel.setTextColor(PCT_UI.COLORS.WHITE);
      } else if (mod.IsPlayerValid(playerTarget)) {
        psui.playerLabel.setTextColor(PCT_UI.COLORS.RED);
      } else {
        return;
      }

      const playerKills = mod.GetPlayerKills(playerTarget);
      const playerDeaths = mod.GetPlayerDeaths(playerTarget);

      if (
        psui.lastRenderedTargetId === mod.GetObjId(playerTarget) &&
        psui.lastRenderedKills === playerKills &&
        psui.lastRenderedDeaths === playerDeaths
      )
        return;

      /*const kdRatio =
        playerKills > 0 && playerDeaths > 0
          ? Math.round((playerKills / playerDeaths + Number.EPSILON) * 100) / 100
          : 0;
      const statsMsg = kdRatio === 0 ? mod.Message("PCT_PLAYER_STATS", playerKills, playerDeaths) : mod.Message("PCT_PLAYER_STATS_KD", playerKills, playerDeaths, kdRatio);*/
      const statsMsg = mod.Message(
        "PCT_PLAYER_STATS",
        playerKills,
        playerDeaths,
      );

      psui.playerLabel.setMessage(mod.Message("{}", playerTarget));
      psui.playerCountInfo.setMessage(
        mod.Message(
          "PCT_PLAYER_COUNT_INFO",
          PlayerTracking.GetTargetPlayerIndex(playerTarget),
          PlayerTracking.GetDeployedPlayersCount(),
        ),
      );
      psui.playerStats.setMessage(statsMsg);
      psui.lastRenderedTargetId = mod.GetObjId(playerTarget);
      psui.lastRenderedKills = playerKills;
      psui.lastRenderedDeaths = playerDeaths;
    }

    export function Destroy(pid: number): void {
      const ps = Player.GetById(pid);
      if (ps === null) return;
      if (ps.ui.targetSelectionUI.root) {
        ps.ui.targetSelectionUI.root.destroy();
        ps.ui.targetSelectionUI.root = null;
        ps.ui.targetSelectionUI.playerLabel = null;
        ps.ui.targetSelectionUI.playerCountInfo = null;
        ps.ui.targetSelectionUI.playerStats = null;
        ps.ui.targetSelectionUI.lastRenderedTargetId = null;
        ps.ui.targetSelectionUI.lastRenderedKills = null;
        ps.ui.targetSelectionUI.lastRenderedDeaths = null;
      }
    }
  }

  /************************
   * PCT Event Handlers
   *************************/

  export async function PCTOnPlayerUIButtonEvent(
    player: mod.Player,
    eventUIWidget: mod.UIWidget,
    eventUIButtonEvent: mod.UIButtonEvent,
  ): Promise<void> {
    await PCT_UI.OnButtonClick(player, eventUIWidget, eventUIButtonEvent);
  }

  export async function PCTOnPlayerDeployed(player: mod.Player): Promise<void> {
    if (!mod.IsPlayerValid(player)) return;

    if (Player.GetIsDirector(player)) {
      await mod.Wait(0.1);
      mod.Teleport(player, V3.ToVector(_directorControlRoomSpawnPos), 0);
    }
  }

  export function PCTOnPlayerInteract(
    player: mod.Player,
    interactPoint: mod.InteractPoint,
  ): void {
    const ipId = mod.GetObjId(interactPoint);

    if (
      _directorInteractPoint &&
      ipId === mod.GetObjId(_directorInteractPoint)
    ) {
      DirectorCodeEntryUI.Init(player);
    }
  }

  export function PCTOnPlayerLeaveGame(pid: number): void {
    const ps = Player.GetById(pid);
    if (!ps) return;

    DirectorMenuUI.Destroy(pid);
    DirectorCodeEntryUI.Destroy(pid);

    Player.RemoveById(pid);
  }
}

//***************************************** */
// EXPERIENCE SCRIPT
// Mandatory: Include the following BF6 Portal API functions and call the PCT function at top level of each.
//***************************************** */

export function OnGameModeStarted() {
  PCT.Initialize(15001, "1234", false); // Adjust as needed. Optional 'defaultConfig' is also available for additional parameters.
}

export function OnPlayerDeployed(eventPlayer: mod.Player): void {
  PCT.PCTOnPlayerDeployed(eventPlayer);
}

export function OnPlayerInteract(
  eventPlayer: mod.Player,
  eventInteractPoint: mod.InteractPoint,
): void {
  PCT.PCTOnPlayerInteract(eventPlayer, eventInteractPoint);
}

export function OnPlayerLeaveGame(eventNumber: number): void {
  PCT.PCTOnPlayerLeaveGame(eventNumber);
}

export async function OnPlayerUIButtonEvent(
  eventPlayer: mod.Player,
  eventUIWidget: mod.UIWidget,
  eventUIButtonEvent: mod.UIButtonEvent,
) {
  PCT.PCTOnPlayerUIButtonEvent(eventPlayer, eventUIWidget, eventUIButtonEvent);
}

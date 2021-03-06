/**
 * @class Ext.panel.Panel
 * @extends Ext.AbstractPanel
 * <p>Panel is a container that has specific functionality and structural components that make
 * it the perfect building block for application-oriented user interfaces.</p>
 * <p>Panels are, by virtue of their inheritance from {@link Ext.container.Container}, capable
 * of being configured with a {@link Ext.container.Container#layout layout}, and containing child Components.</p>
 * <p>When either specifying child {@link Ext.Component#items items} of a Panel, or dynamically {@link Ext.container.Container#add adding} Components
 * to a Panel, remember to consider how you wish the Panel to arrange those child elements, and whether
 * those child elements need to be sized using one of Ext's built-in <code><b>{@link Ext.container.Container#layout layout}</b></code> schemes. By
 * default, Panels use the {@link Ext.layout.container.Auto Auto} scheme. This simply renders
 * child components, appending them one after the other inside the Container, and <b>does not apply any sizing</b>
 * at all.</p>
 * <p>A Panel may also contain {@link #bbar bottom} and {@link #tbar top} toolbars, along with separate
 * {@link #header}, {@link #footer} and {@link #body} sections (see {@link #frame} for additional
 * information).</p>
 * <p>Panel also provides built-in {@link #collapsible collapsible, expandable} and {@link #closable} behavior.  
 * Panels can be easily dropped into any {@link Ext.container.Container Container} or layout, and the
 * layout and rendering pipeline is {@link Ext.container.Container#add completely managed by the framework}.</p>
 * <p><b>Note:</b> By default, the <code>{@link #closable close}</code> header tool <i>destroys</i> the Panel resulting in removal of the Panel
 * and the destruction of any descendant Components. This makes the Panel object, and all its descendants <b>unusable</b>. To enable the close
 * tool to simply <i>hide</i> a Panel for later re-use, configure the Panel with <b><code>{@link #closeAction closeAction: 'hide'}</code></b>.</p>
 * <p>Usually, Panels are used as constituents within an application, in which case, they would be used as child items of Containers,
 * and would themselves use Ext.Components as child {@link #items}. However to illustrate simply rendering a Panel into the document,
 * here's how to do it:<pre><code>
Ext.create('Ext.panel.Panel', {
    title: 'Hello',
    width: 200,
    html: '<p>World!</p>',
    renderTo: document.body
});
</code></pre></p>
 * <p>A more realistic scenario is a Panel created to house input fields which will not be rendered, but used as a constituent part of a Container:<pre><code>
var filterPanel = Ext.create('Ext.panel.Panel', {
    bodyPadding: 5,  // Don't want content to crunch against the borders
    title: 'Filters',
    items: [{
        xtype: 'datefield',
        fieldLabel: 'Start date'
    }, {
        xtype: 'datefield',
        fieldLabel: 'End date'
    }]
});
</code></pre></p>
 * <p>Note that the Panel above is not configured to render into the document, nor is it configured with a size or position. In a real world scenario,
 * the Container into which the Panel is added will use a {@link #layout} to render, size and position its child Components.</p>
 * <p>Panels will often use specific {@link #layout}s to provide an application with shape and structure by containing and arranging child
 * Components: <pre><code>
var resultsPanel = Ext.create('Ext.panel.Panel', {
    layout: {
        type: 'vbox',       // Arrange child items vertically
        align: 'stretch'    // Each takes up full width
    },
    items: [{               // Results grid specified as a config object with an xtype of 'grid'
        xtype: 'grid',
        border: false,
        headers: [{header: 'World'}]                  // One header just for show. There's no data,
        store: Ext.create('Ext.data.ArrayStore', {}), // A dummy empty data store
        flex: 1                                       // Use 1/3 of Container's height (hint to Box layout)
    }, {
        xtype: 'splitter',       // A splitter between the two child items
        collapseTarget: 'prev'   // It has a mini-collapse tool: collapse the grid
    }, {                    // Details Panel specified as a config object (no xtype defaults to 'panel').
        bodyPadding: 5,
        items: fieldsArray, // An array of form fields
        flex: 2             // Use 2/3 of Container's height (hint to Box layout)
    }]
});
</code></pre>
 * The example illustrates one possible method of displaying search results. The Panel contains a grid with the resulting data arranged
 * in rows. Each selected row may be displayed in detail in the Panel below. The {@link Ext.layout.container.Vbox vbox} layout is used
 * to arrange the two vertically. It is configured to stretch child items horizontally to full width. Child items may either be configured 
 * with a numeric height, or with a <code>flex</code> value to distribute available space proportionately.</p>
 * <p>This Panel itself may be a child item of, for exaple, a {@link Ext.tab.TabPanel} which will size its child items to fit within its
 * content area.</p>
 * <p>Using these techniques, as long as the <b>layout</b> is chosen and configured correctly, an application may have any level of
 * nested containment, all dynamically sized according to configuration, the user's preference and available browser size.</p>
 * @constructor
 * @param {Object} config The config object
 * @xtype panel
 */
Ext.define('Ext.panel.Panel', {
    extend: 'Ext.AbstractPanel',
    requires: [
        'Ext.panel.Header',
        'Ext.fx.Anim',
        'Ext.util.KeyMap',
        'Ext.panel.DD',
        'Ext.XTemplate',
        'Ext.layout.component.Dock'
    ],
    alias: 'widget.panel',
    alternateClassName: 'Ext.Panel',

    /**
     * @cfg {String} collapsedCls
     * A CSS class to add to the panel's element after it has been collapsed (defaults to
     * <code>'x-panel-collapsed'</code>).
     */

    /**
     * @cfg {Boolean} animCollapse
     * <code>true</code> to animate the transition when the panel is collapsed, <code>false</code> to skip the
     * animation (defaults to <code>true</code> if the {@link Ext.fx.Anim} class is available, otherwise <code>false</code>).
     * May also be specified as the animation duration in milliseconds.
     */
    animCollapse: Ext.enableFx,
    
    /**
     * @cfg {Number} minButtonWidth
     * Minimum width of all footer toolbar buttons in pixels (defaults to <tt>undefined</tt>). If set, this will
     * be used as the default value for the <tt>{@link Ext.button.Button#minWidth}</tt> config of
     * each Button added to the <b>footer toolbar</b>. Will be ignored for buttons that have this value configured some
     * other way, e.g. in their own config object or via the {@link Ext.Container#config-defaults defaults} of
     * their parent container.
     */

    /**
     * @cfg {Boolean} collapsed
     * <code>true</code> to render the panel collapsed, <code>false</code> to render it expanded (defaults to
     * <code>false</code>).
     */
    collapsed: false,

    /**
     * @cfg {Boolean} collapseFirst
     * <code>true</code> to make sure the collapse/expand toggle button always renders first (to the left of)
     * any other tools in the panel's title bar, <code>false</code> to render it last (defaults to <code>true</code>).
     */
    collapseFirst: true,

    /**
     * @cfg {Boolean} hideCollapseTool
     * <code>true</code> to hide the expand/collapse toggle button when <code>{@link #collapsible} == true</code>,
     * <code>false</code> to display it (defaults to <code>false</code>).
     */
    hideCollapseTool: false,

    /**
     * @cfg {Boolean} titleCollapse
     * <code>true</code> to allow expanding and collapsing the panel (when <code>{@link #collapsible} = true</code>)
     * by clicking anywhere in the header bar, <code>false</code>) to allow it only by clicking to tool button
     * (defaults to <code>false</code>)).
     */
    titleCollapse: false,

    /**
     * @cfg {String} collapseMode
     * <p><b>Important: this config is only effective for {@link #collapsible} Panels which are direct child items of a {@link Ext.layout.container.Border border layout}.</b></p>
     * <p>When <i>not</i> a direct child item of a {@link Ext.layout.container.Border border layout}, then the Panel's header remains visible, and the body is collapsed to zero dimensions.
     * If the Panel has no header, then a new header (orientated correctly depending on the {@link #collapseDirection}) will be inserted to show a the title and a re-expand tool.</p>
     * <p>When a child item of a {@link Ext.layout.container.Border border layout}, this config has two options:
     * <div class="mdetail-params"><ul>
     * <li><b><code>alt</code></b> : <b>Default.</b><div class="sub-desc">When collapsed, a placeholder Container is injected into the layout to represent the Panel
     * and to provide a UI with a Tool to allow the user to re-expand the Panel.</div></li>
     * <li><b><code>header</code></b> : <div class="sub-desc">The Panel collapses to leave a header visible as when not inside a {@link Ext.layout.container.Border border layout}.</div></li>
     * </ul></div></p>
     */

    /**
     * @cfg {Mixed} placeHolder
     * <p><b>Important: This config is only effective for {@link #collapsible} Panels which are direct child items of a {@link Ext.layout.container.Border border layout}
     * when using the default <code>'alt'</code> {@link #collapseMode}.</b></p>
     * <p>b>Optional.</b> A Component (or config object for a Component) to show in place of this Panel when this Panel is collapsed by a
     * {@link Ext.layout.container.Border border layout}. Defaults to a generated {@link Ext.panel.Header Header}
     * containing a {@link Ext.panel.Tool Tool} to re-expand the Panel.</p>
     */

    /**
     * @cfg {Boolean} floatable
     * <p><b>Important: This config is only effective for {@link #collapsible} Panels which are direct child items of a {@link Ext.layout.container.Border border layout}.</b></p>
     * <tt>true</tt> to allow clicking a collapsed Panel's {@link #placeHolder} to display the Panel floated
     * above the layout, <tt>false</tt> to force the user to fully expand a collapsed region by
     * clicking the expand button to see it again (defaults to <tt>true</tt>).
     */
    floatable: true,

    /**
     * @cfg {Boolean} collapsible
     * <p>True to make the panel collapsible and have an expand/collapse toggle Tool added into
     * the header tool button area. False to keep the panel sized either statically, or by an owning layout manager, with no toggle Tool (defaults to false).</p>
     * See {@link #collapseMode} and {@link #collapseDirection}
     */
    collapsible: false,

    /**
     * @cfg {Boolean} collapseDirection
     * <p>The direction to collapse the Panel when the toggle button is clicked.</p>
     * <p>Defaults to the {@link #headerPosition}</p>
     * <p><b>Important: This config is <u>ignored</u> for {@link #collapsible} Panels which are direct child items of a {@link Ext.layout.container.Border border layout}.</b></p>
     * <p>Specify as <code>'top'</code>, <code>'bottom'</code>, <code>'left'</code> or <code>'right'</code>.</p>
     */

    /**
     * @cfg {Boolean} closable
     * <p>True to display the 'close' tool button and allow the user to close the window, false to
     * hide the button and disallow closing the window (defaults to <code>false</code>).</p>
     * <p>By default, when close is requested by clicking the close button in the header, the {@link #close}
     * method will be called. This will <i>{@link Ext.Component#destroy destroy}</i> the Panel and its content
     * meaning that it may not be reused.</p>
     * <p>To make closing a Panel <i>hide</i> the Panel so that it may be reused, set
     * {@link #closeAction} to 'hide'.</p>
     */
    closable: false,

    /**
     * @cfg {String} closeAction
     * <p>The action to take when the close header tool is clicked:
     * <div class="mdetail-params"><ul>
     * <li><b><code>'{@link #close}'</code></b> : <b>Default</b><div class="sub-desc">
     * {@link #close remove} the window from the DOM and {@link Ext.Component#destroy destroy}
     * it and all descendant Components. The window will <b>not</b> be available to be
     * redisplayed via the {@link #show} method.
     * </div></li>
     * <li><b><code>'{@link #hide}'</code></b> : <div class="sub-desc">
     * {@link #hide} the window by setting visibility to hidden and applying negative offsets.
     * The window will be available to be redisplayed via the {@link #show} method.
     * </div></li>
     * </ul></div>
     * <p><b>Note:</b> This behavior has changed! setting *does* affect the {@link #close} method
     * which will invoke the approriate closeAction.
     */
    closeAction: 'destroy',

    /**
     * @cfg {Object/Array} dockedItems
     * A component or series of components to be added as docked items to this panel.
     * The docked items can be docked to either the top, right, left or bottom of a panel.
     * This is typically used for things like toolbars or tab bars:
     * <pre><code>
var panel = new Ext.panel.Panel({
    dockedItems: [{
        xtype: 'toolbar',
        dock: 'top',
        items: [{
            text: 'Docked to the top'
        }]
    }]
});</pre></code>
     */

    /**
      * @cfg {Boolean} preventHeader Prevent a Header from being created and shown. Defaults to false.
      */
    preventHeader: false,
         
     /**
      * @cfg {String} headerPosition Specify as <code>'top'</code>, <code>'bottom'</code>, <code>'left'</code> or <code>'right'</code>. Defaults to <code>'top'</code>.
      */
    headerPosition: 'top',

     /**
     * @cfg {Boolean} frame
     * True to apply a frame to the panel.
     */
    frame: false,

    /**
     * @cfg {Boolean} frameHeader
     * True to apply a frame to the panel panels header (if 'frame' is true).
     */
    frameHeader: true,

    renderTpl: [
        '<div class="{baseCls}-body<tpl if="bodyCls"> {bodyCls}</tpl><tpl if="frame"> {baseCls}-body-framed</tpl><tpl if="ui"> {baseCls}-body-{ui}</tpl>"<tpl if="bodyStyle"> style="{bodyStyle}"</tpl>></div>'
    ],

    initComponent: function() {
        var me = this,
            cls;

        me.callParent();
        if (me.unstyled) {
            me.baseCls = me.baseCSSPrefix + 'plain';
        }

        if (me.frame) {
            me.ui = 'framed';
        }

        me.collapsedCls = me.collapsedCls || me.baseCls + '-collapsed';
        me.collapseDirection = me.collapseDirection || me.headerPosition || Ext.Component.DIRECTION_TOP;

        // CSC class name to add to Header Component upon Panel collapse
        me.collapsedHeaderCls = Ext.baseCSSPrefix + 'panel-' + (me.border === false ? 'noborder-' : '') + 'collapsed-header';

        // Backwards compatibility
        me.bridgeToolbars();
    },

    hideBorders : function() {
        var me = this,
            cls = me.baseCls + '-noborder';

        me.addCls(cls);
        if (me.rendered) {
            me.body.addCls(cls + '-body');
        }
        else {
            me.renderData.bodyCls = me.renderData.bodyCls || '' + (' ' + cls + '-body');
        }
    },

    showBorders : function() {
        var me = this,
            cls = me.baseCls + '-noborder';

        me.removeCls(cls);
        if (me.rendered) {
            me.body.removeCls(cls + '-body');
        }
        else {
            me.renderData.bodyCls = me.renderData.bodyCls.replace(cls + '-body', '');
        }
    },

    beforeDestroy: function() {
        Ext.destroy(
            this.ghostPanel
        );
        this.callParent();
    },

    initAria: function() {
        Ext.panel.Panel.superclass.initAria.call(this);
        this.initHeaderAria();
    },

    initHeaderAria: function() {
        var me = this,
            el = me.el,
            header = me.header;
        if (el && header) {
            el.dom.setAttribute('aria-labelledby', header.titleCmp.id);
        }
    },

    /**
     * Set a title for the panel's header. See {@link Ext.panel.Header#title}.
     * @param {String} title
     */
    setTitle: function(title) {
        var me = this;
        me.title = title;
        if (me.header) {
            me.header.setTitle(title);
        } else {
            me.updateHeader();
        }
    },

    /**
     * Set the iconCls for the panel's header. See {@link Ext.panel.Header#iconCls}.
     * @param cls
     */
    setIconClass: function(cls) {
        this.iconCls = cls;
        var header = this.header;
        if (header) {
            header.setIconClass(cls);
        }
    },

    initItems: function() {
        // Catch addition of descendant fields
        this.on('add', this.onSubCmpAdded, this);
        this.callParent(arguments);
    },

    onSubCmpAdded: function(parent, cmp) {
        var minButtonWidth = this.minButtonWidth;

        if (minButtonWidth && cmp.isButton/* && parent && parent.ui == 'footer'*/) {
            if (!cmp.hasOwnProperty('minWidth')) {
                cmp.minWidth = minButtonWidth;
            }
        }
    },

    bridgeToolbars: function() {
        var me = this,
            fbar,
            buttons = me.buttons,
            minButtonWidth = me.minButtonWidth,
            initToolbar = function(toolbar, pos) {
                if (Ext.isArray(toolbar)) {
                    toolbar = {
                        xtype: 'toolbar',
                        items: toolbar
                    };
                }
                else if (!toolbar.xtype) {
                    toolbar.xtype = 'toolbar';
                }
                toolbar.dock = pos;
            return toolbar;
        };
        
        // Apply the minButtonWidth config to the items in the 'buttons' toolbar config
        if (buttons && minButtonWidth) {
            Ext.each(buttons, function(button) {
                if (Ext.isObject(button) && !('minWidth' in button)) {
                    button.minWidth = minButtonWidth;
                }
            });
        }

        // Backwards compatibility
        
        /**
         * @cfg {Object/Array} tbar

Convenience method. Short for 'Top Bar'.

    tbar: [
      { xtype: 'button', text: 'Button 1' }
    ]
    
is equivalent to 
    
    dockedItems: [{
        xtype: 'toolbar',
        dock: 'top',
        items: [
            { xtype: 'button', text: 'Button 1' }
        ]
    }]

         * @markdown
         */
        if (me.tbar) {
            me.addDocked(initToolbar(me.tbar, 'top'));
            me.tbar = null;
        }

        /**
         * @cfg {Object/Array} bbar

Convenience method. Short for 'Bottom Bar'.

    bbar: [
      { xtype: 'button', text: 'Button 1' }
    ]
    
is equivalent to 
    
    dockedItems: [{
        xtype: 'toolbar',
        dock: 'bottom',
        items: [
            { xtype: 'button', text: 'Button 1' }
        ]
    }]

         * @markdown
         */
        if (me.bbar) {
            me.addDocked(initToolbar(me.bbar, 'bottom'));
            me.bbar = null;
        }

        /**
         * @cfg {Object/Array} buttons

Convenience method used for adding buttons docked to the bottom right of the panel.

    buttons: [
      { text: 'Button 1' }
    ]
    
is equivalent to 
    
    dockedItems: [{
        xtype: 'toolbar',
        dock: 'bottom',
        items: [
            { xtype: 'component', flex: 1 },
            { xtype: 'button', text: 'Button 1' }
        ]
    }]

         * @markdown
         */
        if (me.buttons) {
            me.fbar = me.buttons;
            me.buttons = null;
        }

        /**
         * @cfg {Object/Array} fbar

Convenience method used for adding items to the bottom right of the panel. Short for Footer Bar.

    fbar: [
      { type: 'button', text: 'Button 1' }
    ]
    
is equivalent to 
    
    dockedItems: [{
        xtype: 'toolbar',
        dock: 'bottom',
        items: [
            { xtype: 'component', flex: 1 },
            { xtype: 'button', text: 'Button 1' }
        ]
    }]

         * @markdown
         */
        if (me.fbar) {
            fbar = initToolbar(me.fbar, 'bottom');
            fbar.ui = 'footer';

            fbar = me.addDocked(fbar)[0];
            fbar.insert(0, {
                flex: 1,
                xtype: 'component'
            });
            me.fbar = null;
        }
    },

    /**
     * @private
     * Tools are a Panel-specific capabilty.
     * Panel uses initTools. Subclasses may contribute tools by implementing addTools.
     */
    initTools: function() {
        var me = this;

        me.tools = me.tools || [];

        // Add a collapse tool unless configured to not show a collapse tool
        // or to not even show a header.
        if (me.collapsible && !(me.hideCollapseTool || me.header === false)) {
            me.collapseDirection = me.collapseDirection || me.headerPosition || 'top';
            me.collapseTool = me.expandTool = me.createComponent({
                xtype: 'tool',
                type: 'collapse-' + me.collapseDirection,
                expandType: me.getOppositeDirection(me.collapseDirection),
                handler: me.toggleCollapse,
                scope: me
            });

            // Prepend collapse tool is configured to do so.
            if (me.collapseFirst) {
                me.tools.unshift(me.collapseTool);
            }
        }

        // Add subclass-specific tools.
        this.addTools();

        // Make Panel closable.
        if (this.closable) {
            this.addCls(this.baseCls + '-closable');
            this.addTool({
                type: 'close',
                handler: Ext.Function.bind(this.close, this, [])
            });
        }

        // Append collapse tool if needed.
        if (me.collapseTool && !me.collapseFirst) {
            me.tools.push(me.collapseTool);
        }
    },

    /**
     * @private
     * Template method to be implemented in subclasses to add their tools after the collapsible tool.
     */
    addTools: Ext.emptyFn,

    /**
     * <p>Closes the Panel. By default, this method, removes it from the DOM, {@link Ext.Component#destroy destroy}s
     * the Panel object and all its descendant Components. The {@link #beforeclose beforeclose}
     * event is fired before the close happens and will cancel the close action if it returns false.<p>
     * <p><b>Note:</b> This method is not affected by the {@link #closeAction} setting which
     * only affects the action triggered when clicking the {@link #closable 'close' tool in the header}.
     * To hide the Panel without destroying it, call {@link #hide}.</p>
     */
    close: function() {
        if (this.fireEvent('beforeclose', this) !== false) {
            this.doClose();
        }
    },

    // private
    doClose: function() {
        this.fireEvent('close', this);
        this[this.closeAction]();
    },

    onRender: function(ct, position) {
        var me = this,
            topContainer;

        // Correct border visibility just before render.
        if (me.border === false) {
            me.hideBorders();
        }

        // Add class-specific header tools.
        // Panel adds collapsible and closable.
        me.initTools();

        // Dock the header/title
        me.updateHeader();

        // Call to super after adding the header, to prevent an unnecessary re-layout
        me.callParent(arguments);

        // If initially collapsed, collapsed flag must indicate true current state at this point.
        // Do collapse after the first time the Panel's structure has been laid out.
        if (me.collapsed) {
            me.collapsed = false;
            topContainer = me.findLayoutController();
            if (topContainer) {
                topContainer.on({
                    afterlayout: function() {
                        me.collapse(null, false, true);
                    },
                    single: true
                });
            } else {
                me.componentLayout.afterLayout = function() {
                    delete me.componentLayout.afterLayout;
                    this.constructor.afterLayout.apply(this, arguments);
                    me.collapse(null, false, true);
                };
            }
        }
    },

    /**
     * Create, hide, or show the header component as appropriate based on the current config.
     * @private
     * @param {Boolean} force True to force the the header to be created
     */
    updateHeader: function(force) {
        var me = this,
            header = me.header,
            title = me.title,
            tools = me.tools;

        if (!me.preventHeader && (force || title || (tools && tools.length))) {
            if (!header) {
                header = me.header = new Ext.panel.Header({
                    title       : title,
                    orientation : (me.headerPosition == 'left' || me.headerPosition == 'right') ? 'vertical' : 'horizontal',
                    dock        : me.headerPosition || 'top',
                    textCls     : me.headerTextCls,
                    iconCls     : me.iconCls,
                    baseCls     : me.baseCls + '-header',
                    tools       : tools,
                    ui          : me.ui,
                    indicateDrag: me.draggable,
                    frame       : me.frame && me.frameHeader,
                    ignoreParentFrame : me.frame || me.overlapHeader,
                    listeners   : me.collapsible && me.titleCollapse ? {
                        click: me.toggleCollapse,
                        scope: me
                    } : null
                });
                me.addDocked(header, 0);

                // Reference the Header's tool array.
                // Header injects named references.
                me.tools = header.tools;
            }
            header.show();
            me.initHeaderAria();
        } else if (header) {
            header.hide();
        }
    },

    // private
    getContentTarget: function() {
        return this.body;
    },

    getTargetEl: function() {
        return this.body || this.frameBody || this.el;
    },

    addTool: function(tool) {
        this.tools.push(tool);
        var header = this.header;
        if (header) {
            header.addTool(tool);
        }
        this.updateHeader();
    },

    getOppositeDirection: function(d) {
        var c = Ext.Component;
        switch (d) {
            case c.DIRECTION_TOP:
                return c.DIRECTION_BOTTOM;
            case c.DIRECTION_RIGHT:
                return c.DIRECTION_LEFT;
            case c.DIRECTION_BOTTOM:
                return c.DIRECTION_TOP;
            case c.DIRECTION_LEFT:
                return c.DIRECTION_RIGHT;
        }
    },

    /**
     * Collapses the panel body so that the body becomes hidden. Docked Components parallel to the
     * border towards which the collapse takes place will remain visible.  Fires the {@link #beforecollapse} event which will
     * cancel the collapse action if it returns false.
     * @param {Number} direction. The direction to collapse towards. Must be one of<ul>
     * <li>Ext.Component.DIRECTION_TOP</li>
     * <li>Ext.Component.DIRECTION_RIGHT</li>
     * <li>Ext.Component.DIRECTION_BOTTOM</li>
     * <li>Ext.Component.DIRECTION_LEFT</li></ul>
     * @param {Boolean} animate True to animate the transition, else false (defaults to the value of the
     * {@link #animCollapse} panel config)
     * @return {Ext.panel.Panel} this
     */
    collapse: function(direction, animate, /* private - passed if called at render time */ internal) {
        var me = this,
            c = Ext.Component,
            height = me.getHeight(),
            width = me.getWidth(),
            newSize = 0,
            dockedItems = me.dockedItems.items,
            dockedItemCount = dockedItems.length,
            i = 0,
            comp,
            pos,
            anim = {
                from: {
                    height: height,
                    width: width
                },
                to: {
                    height: height,
                    width: width
                },
                listeners: {
                    afteranimate: me.afterCollapse,
                    scope: me
                },
                duration: Ext.num(animate, Ext.fx.Anim.prototype.duration)
            },
            reExpander,
            reExpanderOrientation,
            reExpanderDock,
            getDimension,
            setDimension,
            collapseDimension;

        if (!direction) {
            direction = me.collapseDirection;
        }

        // If internal (Called because of initial collapsed state), then no animation, and no events.
        if (internal) {
            animate = false;
        } else if (me.collapsed || me.fireEvent('beforecollapse', me, direction, animate) === false) {
            return false;
        }

        reExpanderDock = direction;
        me.expandDirection = me.getOppositeDirection(direction);

        // Track docked items which we hide during collapsed state
        me.hiddenDocked = [];

        switch (direction) {
            case c.DIRECTION_TOP:
            case c.DIRECTION_BOTTOM:
                me.expandedSize = me.getHeight();
                reExpanderOrientation = 'horizontal';
                collapseDimension = 'height';
                getDimension = 'getHeight';
                setDimension = 'setHeight';

                // Collect the height of the visible header.
                // Hide all docked items except the header.
                // Hide *ALL* docked items if we're going to end up hiding the whole Panel anyway
                for (; i < dockedItemCount; i++) {
                    comp = dockedItems[i];
                    if (comp.isVisible()) {
                        if (comp.isHeader && (!comp.dock || comp.dock == 'top' || comp.dock == 'bottom')) {
                            reExpander = comp;
                        } else {
                            me.hiddenDocked.push(comp);
                        }
                    }
                }

                if (direction == Ext.Component.DIRECTION_BOTTOM) {
                    pos = me.getPosition()[1] - Ext.fly(me.el.dom.offsetParent).getRegion().top;
                    anim.from.top = pos;
                }
                break;

            case c.DIRECTION_LEFT:
            case c.DIRECTION_RIGHT:
                me.expandedSize = me.getWidth();
                reExpanderOrientation = 'vertical';
                collapseDimension = 'width';
                getDimension = 'getWidth';
                setDimension = 'setWidth';

                // Collect the height of the visible header.
                // Hide all docked items except the header.
                // Hide *ALL* docked items if we're going to end up hiding the whole Panel anyway
                for (; i < dockedItemCount; i++) {
                    comp = dockedItems[i];
                    if (comp.isVisible()) {
                        if (comp.isHeader && (comp.dock == 'left' || comp.dock == 'right')) {
                            reExpander = comp;
                        } else {
                            me.hiddenDocked.push(comp);
                        }
                    }
                }

                if (direction == Ext.Component.DIRECTION_RIGHT) {
                    pos = me.getPosition()[0] - Ext.fly(me.el.dom.offsetParent).getRegion().left;
                    anim.from.left = pos;
                }
                break;

            default:
                throw('Panel collapse must be passed a valid Component collapse direction');
        }

        // No scrollbars when we shrink this Panel
        // And no laying out of any children... we're effectively *hiding* the body
        me.setAutoScroll(false);
        me.suspendLayout = true;
        me.body.setVisibilityMode(Ext.core.Element.DISPLAY);

        // Disable toggle tool during animated collapse
        if (animate && me.collapseTool) {
            me.collapseTool.disable();
        }

        // Add the collapsed class now, so that collapsed CSS rules are applied before measurements are taken.
        me.el.addCls(me.collapsedCls);

        // We found a header: Measure it to find the collapse-to size.
        if (reExpander) {
            reExpander.addCls(me.collapsedHeaderCls);
            newSize = reExpander[getDimension]();
        }
        // No header: Render and insert a temporary one, and then measure it.
        else {
            reExpander = {
                hideMode: 'offsets',
                temporary: true,
                title: me.title,
                orientation: reExpanderOrientation,
                dock: reExpanderDock,
                textCls: me.headerTextCls,
                iconCls: me.iconCls,
                baseCls: me.baseCls + '-header',
                ui: me.ui,
                indicateDrag: me.draggable,
                cls: me.baseCls + '-collapsed-placeholder ' + me.collapsedHeaderCls,
                renderTo: me.getTargetEl()
            };
            reExpander[(reExpander.orientation == 'horizontal') ? 'tools' : 'items'] = [{
                xtype: 'tool',
                type: 'expand-' + me.expandDirection,
                handler: me.toggleCollapse,
                scope: me
            }];

            reExpander = me.reExpander = Ext.create('Ext.panel.Header', reExpander);

            // Hack for IE6/7's inability to display an inline-block
            // No, seriously, this has to be here. Check examples/panel/panel.html, and collapse the second Panel.
            // Without this, it's broken.
            if ((Ext.isIE6 || Ext.isIE7) && (reExpanderOrientation == 'vertical')) {
                newSize = 25;
                reExpander.el.dom.style.display = 'block';
                reExpander[setDimension](newSize);
                reExpander.el.dom.style.display = '';
            } else {
                newSize = reExpander[getDimension]();
            }
            reExpander.hide();

            // Insert the new docked item
            me.insertDocked(0, reExpander);
        }

        me.reExpander = reExpander;

        // If collapsing right or down, we'll be also animating the left or top.
        if (direction == Ext.Component.DIRECTION_RIGHT) {
            anim.to.left = pos + (width - newSize);
        } else if (direction == Ext.Component.DIRECTION_BOTTOM) {
            anim.to.top = pos + (height - newSize);
        }

        // Animate to the new size
        anim.to[collapseDimension] = newSize;

        // Remove any flex config before we attempt to collapse.
        me.savedFlex = me.flex;
        me.savedMinWidth = me.minWidth;
        me.savedMinHeight = me.minHeight;
        me.minWidth = 0;
        me.minHeight = 0;
        delete me.flex;

        if (animate) {
            this.animate(anim);
        } else {
            me.setSize(anim.to.width, anim.to.height);
            if (Ext.isDefined(anim.to.left) || Ext.isDefined(anim.to.top)) {
                me.setPosition(anim.to.left, anim.to.top);
            }
            me.afterCollapse(false, internal);
        }
        return me;
    },

    afterCollapse: function(animated, internal) {
        var me = this,
            i = 0,
            l = me.hiddenDocked.length;

        me.minWidth = me.savedMinWidth;
        me.minHeight = me.savedMinHeight;

        me.body.hide();
        for (; i < l; i++) {
            me.hiddenDocked[i].hidden = true;
        }
        if (me.reExpander) {
            me.reExpander.show();
        }
        me.collapsed = true;

        if (!internal) {
            if (me.ownerCt) {
                me.ownerCt.doLayout();
            } else {
                me.doComponentLayout();
            }
        }

        // If me Panel was configured with a collapse tool in its header, flip it's type
        if (me.collapseTool) {
            me.collapseTool.setType('expand-' + me.expandDirection);
        }
        if (!internal) {
            me.fireEvent('collapse', me);
        }

        // Re-enable the toggle tool after an animated collapse
        if (animated && me.collapseTool) {
            me.collapseTool.enable();
        }
    },

    /**
     * Expands the panel body so that it becomes visible.  Fires the {@link #beforeexpand} event which will
     * cancel the expand action if it returns false.
     * @param {Boolean} animate True to animate the transition, else false (defaults to the value of the
     * {@link #animCollapse} panel config)
     * @return {Ext.panel.Panel} this
     */
    expand: function(animate) {
        if (!this.collapsed || this.fireEvent('beforeexpand', this, animate) === false) {
            return false;
        }
        var me = this,
            i = 0,
            l = me.hiddenDocked.length,
            direction = me.expandDirection,
            height = me.getHeight(),
            width = me.getWidth(),
            pos, anim, satisfyJSLint;

        // Disable toggle tool during animated expand
        if (animate && me.collapseTool) {
            me.collapseTool.disable();
        }

        // Show any docked items that we hid on collapse
        // And hide the injected reExpander Header
        for (; i < l; i++) {
            me.hiddenDocked[i].hidden = false;
        }
        if (me.reExpander) {
            if (me.reExpander.temporary) {
                me.reExpander.hide();
            } else {
                me.reExpander.removeCls(me.collapsedHeaderCls);
            }
        }

        // If me Panel was configured with a collapse tool in its header, flip it's type
        if (me.collapseTool) {
            me.collapseTool.setType('collapse-' + me.collapseDirection);
        }

        // Unset the flag before the potential call to calculateChildBox to calculate our newly flexed size
        me.collapsed = false;

        // Collapsed means body element was hidden
        me.body.show();

        // Remove any collapsed styling before any animation begins
        me.el.removeCls(me.collapsedCls);

        anim = {
            to: {
            },
            from: {
                height: height,
                width: width
            },
            listeners: {
                afteranimate: me.afterExpand,
                scope: me
            }
        };

        if ((direction == Ext.Component.DIRECTION_TOP) || (direction == Ext.Component.DIRECTION_BOTTOM)) {

            // If autoHeight, measure the height now we have shown the body element.
            if (me.autoHeight) {
                me.setCalculatedSize(me.width, null);
                anim.to.height = me.getHeight();

                // Must size back down to collapsed for the animation.
                me.setCalculatedSize(me.width, anim.from.height);
            }
            // If we were flexed, then we can't just restore to the saved size.
            // We must restore to the currently correct, flexed size, so we much ask the Box layout what that is.
            else if (me.savedFlex) {
                me.flex = me.savedFlex;
                anim.to.height = me.ownerCt.layout.calculateChildBox(me).height;
                delete me.flex;
            }
            // Else, restore to saved height
            else {
                anim.to.height = me.expandedSize;
            }

            // top needs animating upwards
            if (direction == Ext.Component.DIRECTION_TOP) {
                pos = me.getPosition()[1] - Ext.fly(me.el.dom.offsetParent).getRegion().top;
                anim.from.top = pos;
                anim.to.top = pos - (anim.to.height - height);
            }
        } else if ((direction == Ext.Component.DIRECTION_LEFT) || (direction == Ext.Component.DIRECTION_RIGHT)) {

            // If autoWidth, measure the width now we have shown the body element.
            if (me.autoWidth) {
                me.setCalculatedSize(null, me.height);
                anim.to.width = me.getWidth();

                // Must size back down to collapsed for the animation.
                me.setCalculatedSize(anim.from.width, me.height);
            }
            // If we were flexed, then we can't just restore to the saved size.
            // We must restore to the currently correct, flexed size, so we much ask the Box layout what that is.
            else if (me.savedFlex) {
                me.flex = me.savedFlex;
                anim.to.width = me.ownerCt.layout.calculateChildBox(me).width;
                delete me.flex;
            }
            // Else, restore to saved width
            else {
                anim.to.width = me.expandedSize;
            }

            // left needs animating leftwards
            if (direction == Ext.Component.DIRECTION_LEFT) {
                pos = me.getPosition()[0] - Ext.fly(me.el.dom.offsetParent).getRegion().left;
                anim.from.left = pos;
                anim.to.left = pos - (anim.to.width - width);
            }
        }

        if (animate) {
            me.animate(anim);
        } else {
            me.setSize(anim.to.width, anim.to.height);
            if (anim.to.x) {
                me.setLeft(anim.to.x);
            }
            if (anim.to.y) {
                me.setTop(anim.to.y);
            }
            me.afterExpand(false);
        }

        return me;
    },

    afterExpand: function(animated) {
        var me = this;
        me.setAutoScroll(me.initialConfig.autoScroll);

        // Restored to a calculated flex. Delete the set width and height properties so that flex works from now on.
        if (me.savedFlex) {
            me.flex = me.savedFlex;
            delete me.savedFlex;
            delete me.width;
            delete me.height;
        }

        // Reinstate layout out after Panel has re-expanded
        delete me.suspendLayout;
        delete me.layout.onLayout;
        if (animated && me.ownerCt) {
            me.ownerCt.doLayout();
        }

        me.fireEvent('expand', me);

        // Re-enable the toggle tool after an animated expand
        if (animated && me.collapseTool) {
            me.collapseTool.enable();
        }
    },

    /**
     * Shortcut for performing an {@link #expand} or {@link #collapse} based on the current state of the panel.
     * @return {Ext.panel.Panel} this
     */
    toggleCollapse: function() {
        if (this.collapsed) {
            this.expand(this.animCollapse);
        } else {
            this.collapse(this.collapseDirection, this.animCollapse);
        }
        return this;
    },

    // private
    getKeyMap : function(){
        if(!this.keyMap){
            this.keyMap = new Ext.util.KeyMap(this.el, this.keys);
        }
        return this.keyMap;
    },

    // private
    initDraggable : function(){
        /**
         * <p>If this Panel is configured {@link #draggable}, this property will contain
         * an instance of {@link Ext.dd.DragSource} which handles dragging the Panel.</p>
         * The developer must provide implementations of the abstract methods of {@link Ext.dd.DragSource}
         * in order to supply behaviour for each stage of the drag/drop process. See {@link #draggable}.
         * @type Ext.dd.DragSource.
         * @property dd
         */
        this.dd = new Ext.panel.DD(this, Ext.isBoolean(this.draggable) ? null : this.draggable);
    },

    // private - used for dragging
    ghost: function(cls) {
        var me = this,
            box = me.getBox();

        if (!me.ghostPanel) {
            me.ghostPanel = new Ext.panel.Panel({
                renderTo: document.body,
                floating: true,
                frame: me.frame,
                title: me.title,
                overlapHeader: me.overlapHeader,
                headerPosition: me.headerPosition,
                width: me.getWidth(),
                height: me.getHeight(),
                baseCls: me.baseCls,
                tools: [{
                    type: 'placeholder'
                }],
                cls: me.baseCls + '-ghost ' + (cls ||'')
            });
        }
        me.ghostPanel.floatParent = me.floatParent;
        me.ghostPanel.setZIndex(Ext.num(me.el.getStyle('zIndex'), 0));
        me.ghostPanel.el.show();
        me.ghostPanel.setPosition(box.x, box.y);
        me.ghostPanel.setSize(box.width, box.height);
        me.el.hide();
        if (me.floatingItems) {
            me.floatingItems.hide();
        }
        return me.ghostPanel;
    },

    // private
    unghost: function(show, matchPosition) {
        var me = this;
        if (!me.ghostPanel) {
            return;
        }
        if (show !== false) {
            me.el.show();
            if (matchPosition !== false) {
                me.setPosition(me.ghostPanel.getPosition());
            }
            if (me.floatingItems) {
                me.floatingItems.show();
            }
            Ext.defer(me.focus, 10, me);
        }
        me.ghostPanel.el.hide();
    },

    // should update body's el.
    doAutoLoad: function() {

    }
});

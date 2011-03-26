/**
 * @class Ext.panel.Header
 * @extends Ext.container.Container
 * Simple header class which is used for on {@link Ext.panel.Panel} and {@link Ext.window.Window}
 * @xtype header
 */
Ext.define('Ext.panel.Header', {
    extend: 'Ext.container.Container',
    uses: ['Ext.panel.Tool', 'Ext.draw.Component', 'Ext.util.CSS'],
    alias: 'widget.header',

    isHeader       : true,
    defaultType    : 'tool',
    indicateDrag   : false,

    renderTpl: ['<div class="{baseCls}-body<tpl if="ui"> {baseCls}-body-{ui}</tpl>"<tpl if="bodyStyle"> style="{bodyStyle}"</tpl>></div>'],

    initComponent: function() {
        var me = this,
            rule,
            style,
            titleTextEl;

        me.indicateDragCls = me.baseCls + '-draggable';
        me.title = me.title || '&#160;';
        me.tools = me.tools || [];
        me.items = me.items || [];
        me.orientation = me.orientation||'horizontal';
        me.addCls(me.baseCls + '-' + me.orientation);
        me.addCls(me.baseCls + '-' + me.dock);

        Ext.applyIf(me.renderSelectors, {
            body: '.' + me.baseCls + '-body'
        });

        if (me.frame) {
            me.ui = 'framed';
        }
        
        // Add Icon
        if (!Ext.isEmpty(me.iconCls)) {
            me.initIconCmp();
            me.items.push(me.iconCmp);
        }

        // Add Title
        if (me.orientation == 'vertical') {
            // Hack for IE6/7's inability to display an inline-block
            // if (Ext.isIE6||Ext.isIE7) {
            //     me.width = me.width||22;
            // }
            me.layout = {
                type : 'vbox',
                align: 'center',
                clearInnerCtOnLayout: true,
                bindToOwnerCtContainer: false
            };
            me.textConfig = {
                cls: me.baseCls + '-text',
                type: 'text',
                text: me.title,
                rotate: {
                    degrees: 90
                }
            };
            rule = Ext.util.CSS.getRule('.' + me.baseCls + '-text');
            if (rule) {
                style = rule.style;
            }
            if (style) {
                Ext.apply(me.textConfig, {
                    'font-family': style.fontFamily,
                    'font-weight': style.fontWeight,
                    'font-size': style.fontSize,
                    fill: style.color
                });
            }
            me.titleCmp = new Ext.draw.Component({
                ariaRole  : 'heading',
                viewBox: false,
                autoSize: true,
                margins: '5 0 0 0',
                items: [ me.textConfig ],
                renderSelectors: {
                    textEl: '.' + me.baseCls + '-text'
                }
            });
        } else {
            me.layout = {
                type : 'hbox',
                align: 'middle',
                clearInnerCtOnLayout: true,
                bindToOwnerCtContainer: false
            };
            me.titleCmp = new Ext.Component({
                xtype     : 'component',
                ariaRole  : 'heading',
                focusable: false,
                renderTpl : ['<span class="{cls}-text">{title}</span>'],
                renderData: {
                    title: me.title,
                    cls  : me.baseCls
                },
                renderSelectors: {
                    textEl: '.' + me.baseCls + '-text'
                }
            });
        }
        me.items.push(me.titleCmp);

        // Spacer ->
        me.items.push({
            xtype: 'component',
            html : '&nbsp;',
            flex : 1,
            focusable: false
        });

        // Add Tools
        me.items = me.items.concat(me.tools);
        Ext.panel.Header.superclass.initComponent.call(me);
    },

    initIconCmp: function() {
        this.iconCmp = new Ext.Component({
            renderTpl : ['<img alt="" src="{blank}" class="{cls}-icon {iconCls}"/>'],
            renderData: {
                blank  : Ext.BLANK_IMAGE_URL,
                cls    : this.baseCls,
                iconCls: this.iconCls,
                orientation: this.orientation
            },
            renderSelectors: {
                iconEl: '.' + this.baseCls + '-icon'
            },
            iconCls: this.iconCls
        });
    },

    afterRender: function() {
        var me = this;

        me.el.unselectable();
        if (me.indicateDrag) {
            me.el.addCls(me.indicateDragCls);
        }
        me.mon(me.el, {
            click: me.onClick,
            scope: me
        });
        me.callParent();
    },

    onClick: function(e) {
        if (!e.getTarget(Ext.baseCSSPrefix + 'tool')) {
            this.fireEvent('click', e);
        }
    },

    getTargetEl: function() {
        return this.body || this.frameBody || this.el;
    },

    /**
     * Sets the title of the header.
     * @param {String} title The title to be set
     */
    setTitle: function(title) {
        var me = this;
        me.title = title || '&#160;';
        if (me.rendered) {
            if (me.titleCmp.surface) {
                var sprite = me.titleCmp.surface.items.items[0];
                sprite.setAttributes({
                    text: me.title,
                    rotate: null
                });
                if (me.titleCmp.rendered) {
                    me.titleCmp.surface.redraw(sprite);
                }
            } else {
                me.titleCmp.textEl.update(me.title);
            }
        } else {
            me.on({
                render: function() {
                    me.layout.layout();
                    me.setTitle(title);
                },
                single: true
            });
        }
    },

    /**
     * Sets the CSS class that provides the icon image for this panel.  This method will replace any existing
     * icon class if one has already been set and fire the {@link #iconchange} event after completion.
     * @param {String} cls The new CSS class name
     */
    setIconClass: function(cls) {
        this.iconCls = cls;
        if (!this.iconCmp) {
            this.initIconCmp();
            this.insert(0, this.iconCmp);
        }
        else {
            if (!cls || !cls.length) {
                this.iconCmp.destroy();
            }
            else {
                var iconCmp = this.iconCmp,
                    el      = iconCmp.iconEl;

                el.removeCls(iconCmp.iconCls);
                el.addCls(cls);
                iconCmp.iconCls = cls;
            }
        }
    },

    /**
     * Add a tool to the header
     * @param {Object} tool
     */
    addTool: function(tool) {
        this.tools.push(this.add(tool));
    },

    /**
     * @private
     * Set up the tools.&lt;tool type> link in the owning Panel.
     * Bind the tool to its owning Panel.
     * @param component
     * @param index
     */
    onAdd: function(component, index) {
        this.callParent([arguments]);
        if (component instanceof Ext.panel.Tool) {
            component.bindTo(this.ownerCt);
            this.tools[component.type] = component;
        }
    }
});

/**
 * @class Ext.form.TextArea
 * @extends Ext.form.Text

This class creates a multiline text field, which can be used as a direct replacement for traditional 
textarea fields. In addition, it supports automatically {@link #grow growing} the height of the textarea to 
fit its content.

All of the configuration options from {@link Ext.form.Text} can be used on TextArea.

Example usage:

    new Ext.form.FormPanel({
        title      : 'My Form',
        renderTo   : Ext.getBody(),
        width      : 500,
        bodyPadding: 10,
        items: [{
            xtype     : 'textareafield',
            grow      : true,
            name      : 'message',
            fieldLabel: 'Message',
            anchor    : '100%'
        }]
    });

Some other useful configuration options when using {@link #grow} are {@link #growMin} and {@link #growMax}. These 
allow you to set the minimum and maximum grow heights for the textarea.

 * @constructor
 * Creates a new TextArea
 * @param {Object} config Configuration options
 * @xtype textarea
 * @docauthor Robert Dougan <rob@sencha.com>
 * @markdown
 */
Ext.define('Ext.form.TextArea', {
    extend:'Ext.form.Text',
    alias: ['widget.textareafield', 'widget.textarea'],
    requires: ['Ext.XTemplate', 'Ext.layout.component.form.TextArea'],

    /**
     * @cfg {Number} growMin The minimum height to allow when <tt>{@link Ext.form.Text#grow grow}=true</tt>
     * (defaults to <tt>60</tt>)
     */
    growMin: 60,

    /**
     * @cfg {Number} growMax The maximum height to allow when <tt>{@link Ext.form.Text#grow grow}=true</tt>
     * (defaults to <tt>1000</tt>)
     */
    growMax: 1000,

    /**
     * @cfg {String} growAppend
     * A string that will be appended to the field's current value for the purposes of calculating the target
     * field size. Only used when the {@link #grow} config is <tt>true</tt>. Defaults to a newline for TextArea
     * to ensure there is always a space below the current line.
     */
    growAppend: '\n-',
    
    /**
     * @cfg {Boolean} enterIsSpecial
     * True if you want the enter key to be classed as a <tt>special</tt> key. Special keys are generally navigation 
     * keys (arrows, space, enter). Setting the config property to <tt>true</tt> would mean that you could not insert 
     * returns into the textarea.
     * (defaults to <tt>false</tt>)
     */
    enterIsSpecial: false,

    /**
     * @cfg {Boolean} preventScrollbars <tt>true</tt> to prevent scrollbars from appearing regardless of how much text is
     * in the field. This option is only relevant when {@link #grow} is <tt>true</tt>. Equivalent to setting overflow: hidden, defaults to 
     * <tt>false</tt>.
     */
    preventScrollbars: false,
    
    // private
    componentLayout: 'textareafield',

    // private
    onRender: function(ct, position) {
        var me = this;
        Ext.applyIf(me.subTplData, {
            cols: me.cols,
            rows: me.rows
        });
        
        me.callParent(arguments);
    },
    
    // private
    afterRender: function(){
        var me = this;
        
        me.callParent(arguments);
        
        if (me.grow) {
            if (me.preventScrollbars) {
                me.inputEl.setStyle('overflow', 'hidden');
            }
            me.inputEl.setHeight(me.growMin);
        }    
    },
    
    // private
    fireKey: function(e) {
        if (e.isSpecialKey() && (this.enterIsSpecial || (e.getKey() !== e.ENTER || e.hasModifier()))) {
            this.fireEvent('specialkey', this, e);
        }
    },

    /**
     * Automatically grows the field to accomodate the height of the text up to the maximum field height allowed.
     * This only takes effect if <tt>{@link #grow} = true</tt>, and fires the {@link #autosize} event if
     * the height changes.
     */
    autoSize: function() {
        var me = this,
            height;
        
        if (me.grow && me.rendered) {
            me.doComponentLayout();
            height = me.inputEl.getHeight();
            if (height !== me.lastInputHeight) {
                me.fireEvent('autosize', height);
                me.lastInputHeight = height;
            }
        }
    },
    
    // private
    initAria: function() {
        this.callParent(arguments);
        
        this.getActionEl().dom.setAttribute('aria-multiline', true);
    }
}, function() {
    this.prototype.fieldSubTpl = new Ext.XTemplate(
        '<textarea id="{id}" ',
            '<tpl if="name">name="{name}" </tpl>',
            '<tpl if="rows">rows="{rows}" </tpl>',
            '<tpl if="cols">cols="{cols}" </tpl>',
            '<tpl if="tabIdx">tabIndex="{tabIdx}" </tpl>',
            'class="{fieldCls} {typeCls}" ',
            'style="width:100px;height:60px;" ',
            'autocomplete="off">',
        '</textarea>',
        {
            compiled: true,
            disableFormats: true
        }
    );
});


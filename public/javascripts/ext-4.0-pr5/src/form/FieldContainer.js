/**
 * @class Ext.form.FieldContainer
 * @extends Ext.container.Container

FieldContainer is a derivation of {@link Ext.container.Container Container} that implements the
{@link Ext.form.Labelable Labelable} mixin. This allows it to be configured so that it is rendered with
a {@link #fieldLabel field label} and optional {@link #msgTarget error message} around its sub-items.
This is useful for arranging a group of fields or other components within a single item in a form, so
that it lines up nicely with other fields. A common use is for grouping a set of related fields under
a single label in a form.

The container's configured {@link #items} will be layed out within the field body area according to the
configured {@link #layout} type. The default layout is `'autocontainer'`.

Like regular fields, FieldContainer can inherit its decoration configuration from the
{@link Ext.form.FormPanel#fieldDefaults fieldDefaults} of an enclosing FormPanel. In addition,
FieldContainer itself can pass {@link #fieldDefaults} to any {@link Ext.form.Labelable fields}
it may itself contain.

If you are grouping a set of {@link Ext.form.Checkbox Checkbox} or {@link Ext.form.Radio Radio}
fields in a single labeled container, consider using a {@link Ext.form.CheckboxGroup}
or {@link Ext.form.RadioGroup} instead as they are specialized for handling those types.

__Example usage:__

    Ext.create('Ext.form.FormPanel', {
        renderTo: Ext.getBody(),
        title: 'FieldContainer Example',
        width: 600,
        bodyPadding: 10,

        items: [{
            xtype: 'fieldcontainer',
            fieldLabel: 'Panels',
            labelWidth: 75,

            // The body area will contain three panels, arranged
            // horizontally, separated by draggable splitters.
            layout: 'hbox',
            defaults: {
                height: 50,
                flex: 1
            },
            items: [{
                xtype: 'panel',
                title: 'Panel 1'
            }, {
                xtype: 'splitter'
            }, {
                xtype: 'panel',
                title: 'Panel 2'
            }, {
                xtype: 'splitter'
            }, {
                xtype: 'panel',
                title: 'Panel 3'
            }]
        }]
    });

__Usage of {@link #fieldDefaults}:__

    Ext.create('Ext.form.FormPanel', {
        renderTo: Ext.getBody(),
        title: 'FieldContainer Example',
        width: 350,
        bodyPadding: 10,

        items: [{
            xtype: 'fieldcontainer',
            fieldLabel: 'Your Name',
            labelWidth: 75,
            defaultType: 'textfield',

            // Arrange fields vertically, stretched to full width
            layout: 'anchor',
            defaults: {
                layout: '100%'
            },

            // These config values will be applied to both sub-fields, except
            // for Last Name which will use its own msgTarget.
            fieldDefaults: {
                msgTarget: 'under',
                labelAlign: 'top'
            },

            items: [{
                fieldLabel: 'First Name',
                name: 'firstName'
            }, {
                fieldLabel: 'Last Name',
                name: 'lastName',
                msgTarget: 'under'
            }]
        }]
    });

 * @constructor
 * Creates a new Ext.form.FieldContainer instance.
 * @param {Object} config The component configuration.
 *
 * @xtype fieldcontainer
 * @markdown
 * @docauthor Jason Johnston <jason@sencha.com>
 */
Ext.define('Ext.form.FieldContainer', {
    extend: 'Ext.container.Container',
    mixins: {
        labelable: 'Ext.form.Labelable',
        fieldAncestor: 'Ext.form.FieldAncestor'
    },
    alias: 'widget.fieldcontainer',

    componentLayout: 'field',

    /**
     * @cfg {Boolean} combineLabels
     * If set to true, and there is no defined {@link #fieldLabel}, the field container will automatically
     * generate its label by combining the labels of all the fields it contains. Defaults to false.
     */
    combineLabels: false,

    /**
     * @cfg {String} labelConnector
     * The string to use when joining the labels of individual sub-fields, when {@link #combineLabels} is
     * set to true. Defaults to ', '.
     */
    labelConnector: ', ',

    /**
     * @cfg {Boolean} combineErrors
     * If set to true, the field container will automatically combine and display the validation errors from
     * all the fields it contains as a single error on the container, according to the configured
     * {@link #msgTarget}. Defaults to false.
     */
    combineErrors: false,

    initComponent: function() {
        var me = this,
            onSubCmpAddOrRemove = me.onSubCmpAddOrRemove;

        // Init mixins
        me.initLabelable();
        me.initFieldAncestor();
        
        me.callParent();
    },

    /**
     * @protected Called when a {@link Ext.form.Labelable} instance is added to the container's subtree.
     * @param {Ext.form.Labelable} labelable The instance that was added
     */
    onLabelableAdded: function(labelable) {
        var me = this;
        me.mixins.fieldAncestor.onLabelableAdded.call(this, labelable);
        me.updateLabel();
    },

    /**
     * @protected Called when a {@link Ext.form.Labelable} instance is removed from the container's subtree.
     * @param {Ext.form.Labelable} labelable The instance that was removed
     */
    onLabelableRemoved: function(labelable) {
        var me = this;
        me.mixins.fieldAncestor.onLabelableRemoved.call(this, labelable);
        me.updateLabel();
    },

    onRender: function() {
        var me = this,
            renderSelectors = me.renderSelectors,
            applyIf = Ext.applyIf;

        applyIf(renderSelectors, me.getLabelableSelectors());

        me.callParent(arguments);
    },

    initRenderTpl: function() {
        var me = this;
        if (!me.hasOwnProperty('renderTpl')) {
            me.renderTpl = me.labelableRenderTpl;
        }
        return me.callParent();
    },

    initRenderData: function() {
        return Ext.applyIf(this.callParent(), this.getLabelableRenderData());
    },

    /**
     * Returns the combined field label if {@link #combineLabels} is set to true and if there is no
     * set {@link #fieldLabel}. Otherwise returns the fieldLabel like normal. You can also override
     * this method to provide a custom generated label.
     */
    getFieldLabel: function() {
        var label = this.fieldLabel || '';
        if (!label && this.combineLabels) {
            label = Ext.Array.map(this.query('[isFieldLabelable]'), function(field) {
                return field.getFieldLabel();
            }).join(this.labelConnector);
        }
        return label;
    },

    /**
     * @private Updates the content of the labelEl if it is rendered
     */
    updateLabel: function() {
        var me = this,
            label = me.labelEl;
        if (label) {
            label.update(me.getFieldLabel());
        }
    },

    //private
    onDisable: function() {
        Ext.Array.forEach(this.query('[isFormField]'), function(field) {
            field.disable();
        });
    },

    //private
    onEnable: function() {
        Ext.Array.forEach(this.query('[isFormField]'), function(field) {
            field.enable();
        });
    },


    /**
     * @private Fired when the error message of any field within the container changes, and updates the
     * combined error message to match.
     */
    onFieldErrorChange: function(field, activeError) {
        var me = this,
            oldError = me.getActiveError(),
            invalidFields = Ext.Array.filter(me.query('[isFormField]'), function(field) {
                return field.hasActiveError();
            }),
            newError = me.buildCombinedError(invalidFields);

        if (newError) {
            me.setActiveError(newError);
        } else {
            me.unsetActiveError();
        }

        if (oldError !== newError) {
            me.doComponentLayout();
        }
    },

    /**
     * Takes an Array of invalid {@link Ext.form.Field} objects and builds a combined error message
     * string from them. Defaults to placing each error message on a new line, each one preceded by
     * the field name and a colon. This can be overridden to provide custom combined error message
     * handling, for instance changing the output markup format or sorting the array (it is sorted
     * in order of appearance by default).
     * @param {Array} invalidFields An Array of the sub-fields which are currently invalid.
     * @return {String} The combined error message
     */
    buildCombinedError: function(invalidFields) {
        return Ext.Array.map(invalidFields, function(field) {
            return field.getFieldLabel() + ': ' + field.getActiveError();
        }).join('<br>');
    },

    getTargetEl: function() {
        return this.bodyEl || this.callParent();
    }

});

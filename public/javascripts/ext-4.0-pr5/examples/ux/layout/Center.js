/**
 * @class Ext.ux.layout.Center
 * @extends Ext.layout.container.Fit
 * <p>This is a very simple layout style used to center contents within a container.  This layout works within
 * nested containers and can also be used as expected as a Viewport layout to center the page layout.</p>
 * <p>As a subclass of FitLayout, CenterLayout expects to have a single child panel of the container that uses
 * the layout.  The layout does not require any config options, although the child panel contained within the
 * layout must provide a fixed or percentage width.  The child panel's height will fit to the container by
 * default, but you can specify <tt>autoHeight:true</tt> to allow it to autosize based on its content height.
 * Example usage:</p>
 * <pre><code>
// The content panel is centered in the container
var p = new Ext.Panel({
    title: 'Center Layout',
    layout: 'ux.center',
    items: [{
        title: 'Centered Content',
        flex: 0.75,
        html: 'Some content'
    }]
});

// If you leave the title blank and specify no border
// you'll create a non-visual, structural panel just
// for centering the contents in the main container.
var p = new Ext.Panel({
    layout: 'ux.center',
    border: false,
    items: [{
        title: 'Centered Content',
        width: 300,
        autoHeight: true,
        html: 'Some content'
    }]
});
</code></pre>
 */
Ext.define('Ext.ux.layout.Center', { 
    extend: 'Ext.layout.container.Fit',
    alias: 'layout.ux.center',
	// private
    setItemSize : function(item, width, height){
        this.owner.addCls('ux-layout-center');
        item.addCls('ux-layout-center-item');
        if(item && height > 0) {
            if (width) {
                width = item.width;
                if (Ext.isNumber(item.flex)) {
                    width = this.owner.el.getWidth() * item.flex;
                }
            } 
            item.setSize(width, height);
        }
        
    }
});

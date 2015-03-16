var SOD={}; //Science on Drupal namespace
Ext.onReady(function(){

    Ext.Ajax.timeout = 120000; //2 minutes
    //var pathname = $("#base_url").text();
    ImageModel = Ext.define('ImageModel', {
        extend: 'Ext.data.Model',
        fields: [
            {
		name: 'name'
            },

            {
		name: 'url'//,
            }, 
            {
		name: 'index'
            }, 
            {
		name: 'url_thumb'
            },
	    {  name:'instrument'

	    },
	    
            {
		name: 'size', 
		type: 'float'
            },
            {
		name: 'score', 
		type: 'float'
            },

            {
		name:'lastmod', 
		type:'date', 
		dateFormat:'timestamp'
            }
        ]
    });
    
    Ext.ux.Lightbox.register('a.imagegroup', true);
    var currentSelectedImageGraphURL = "";
    SOD.imageurldefault="";
    SOD.searchimagestore = Ext.create('Ext.data.Store', {
        model: 'ImageModel',

        proxy: {
            type: 'ajax',
            url: Drupal.settings.basePath+'getserch?url='+SOD.imageurldefault,
            reader: {
                type: 'json',
                root: ''
            }
        }
    });
 Ext.define('Graphs', {
    extend: 'Ext.data.Model',
    fields: ['year','countoffiles']
});
SOD.storeHistogram = Ext.create('Ext.data.Store', {
 model: 'Graphs',
  proxy: {
            type: 'ajax',
	     url: Drupal.settings.basePath+'getservice?file='+SOD.imageurldefault+'&threshold=0&histo=true',
	    reader: 'json'
             }
});

SOD.storeHistogram.load();
SOD.storeHistogrambymonth = Ext.create('Ext.data.Store', {
 model: 'Graphs',
        proxy: {
            type: 'ajax',
	     url: Drupal.settings.basePath+'getservice?file='+SOD.imageurldefault+'&threshold=0&histo=true',
	     reader: 'json'
             }
                    
     
});

SOD.storeHistogrambyday = Ext.create('Ext.data.Store', {
 model: 'Graphs',
        proxy: {
            type: 'ajax',
	     url: Drupal.settings.basePath+'getservice?file='+SOD.imageurldefault+'&threshold=0&histo=true',
	     reader: 'json'
             }
                    
     
});
    
SOD.searchimage =Ext.create('Ext.Panel', {
        id: 'image-serach-view',
        frame: true,
        items:[{
	    xtype:'panel',
	    width:400,
	    height:250,
	    frame:false,
	    border:false,
	    bodyBorder:false,
	    html:"<div id='searchedimage' style='float:right;'></div>"
	},{
       xtype:'panel',
	    width:400,
	    height:20,
	    frame:false,
	    margin:5,
	    border:false,
	    bodyBorder:false,
	    html:"<div id='searchedname' style='float:left;'></div>"
}


,{
	    id:'slider',
	    xtype:'slider',
	    margin:5,
	    width: 315,
            value: 0,
            increment: 0.1,
            minValue: 0,
            maxValue: 1,
	    decimalPrecision:true,
	    fieldLabel: "Score Threshold (0-1)",
	    listeners: {
		changecomplete: {
		    fn: function(slider,newValue,thumb) {
			SOD.storeresultImage.proxy.url= Drupal.settings.basePath+'getservice?file='+SOD.imageurldefault+"&threshold="+Ext.getCmp('slider').getValue()+'&histo=false';
			 SOD.storeHistogram.proxy.url=Drupal.settings.basePath+'getservice?file='+SOD.imageurldefault+"&threshold="+Ext.getCmp('slider').getValue()+'&histo=true';
		
	                SOD.storeresultImage.load();
	                SOD.storeHistogram.load();
			
		    }
		}
		    }
		}
 
	    ]
	
	});
    var itemsPerPage=25;
    SOD.storeImage = Ext.create('Ext.data.Store', {
	    autoLoad: {
		start: 0, 
		limit: itemsPerPage
	    },
	    model: 'ImageModel',
	    pageSize: itemsPerPage, // items per page
	    proxy: {
		type: 'ajax',
		url: Drupal.settings.basePath+'getnodeimages',
		reader: {
		    type: 'json',
		    root: 'images',
		    totalProperty: 'total'
		}
	    }
	});
    
    
    
    SOD.storeImage.load({
	    params:{
		start:0,
		    limit: itemsPerPage
		    }
	});
    
    SOD.gallerypanel =Ext.create('Ext.Panel', {
	    id: 'image-gallery-view',
	    frame: true,
        
	    // renderTo: 'dataview-example',
	    title: 'Image Gallery',
	    dockedItems: [{
		    xtype: 'pagingtoolbar',
		    store: SOD.storeImage,   // same store GridPanel is using
		    dock: 'top',
		    displayInfo: true
		}],
                items: [Ext.create('Ext.view.View', {
            
			autoHeight : false,
			store: SOD.storeImage,
			tpl: [
			      '<tpl for=".">',
			      '<div class="thumb-wrap" id="{name}">',
			      '<div class="thumb"><a href="{url}" class="imagegroup" title="{instrument}"><img src="{url_thumb}" title="{instrument}"></a></div>',
			      '<span class="x-editable">{name}</span></div>',
			      '</tpl>',
			      '<div class="x-clear"></div>'
			      ],
			multiSelect: false,            
			trackOver: true,
			autoScroll : true,
			height:500,
			overItemCls: 'x-item-over',
			itemSelector: 'div.thumb-wrap',
			emptyText: 'No images to display',
			plugins: [
				  Ext.create('Ext.ux.DataView.DragSelector', {}),
				  Ext.create('Ext.ux.DataView.LabelEditor', {
					  dataIndex: 'name'
				      })
				  ],
			prepareData: function(data) {
			    Ext.apply(data, {
				    shortName: Ext.util.Format.ellipsis(data.name, 15),
				    sizeString: Ext.util.Format.fileSize(data.size),
				    dateString: Ext.util.Format.date(data.lastmod, "m/d/Y g:i a")
				});
			    return data;
			},
			listeners: {
			    itemdblclick : {
				fn : function (me, record, item, index, e, ePots) {
				}
			    },
			    itemclick : {
				fn : function (me, record, item, index, e, ePots) {
				    //console.log(record);
				    SOD.selectedFileInstrument=record.data.instrument;
				}
			    }
			}
		    })]
	});
    
    SOD.storeresultImage = Ext.create('Ext.data.Store', {
	    autoLoad: {
		start: 0, 
		limit: itemsPerPage
	    },
	    model: 'ImageModel',
	    pageSize: itemsPerPage, // items per page

	    proxy: {
		type: 'ajax',
		timeout:0,
			url: Drupal.settings.basePath+'getservice?file='+SOD.imageurldefault+'&threshold=0&histo=false',
	       reader: {
                type: 'json',
                root: 'images',
                totalProperty: 'total'
	}
        },
	listeners: {
            load: function(sender, node, records) {
           }
	}
    });


var resultpanel =Ext.create('Ext.Panel', {
        id: 'images-result-view',
        frame: true,
        title: 'Result Image',
        dockedItems: [{
            xtype: 'pagingtoolbar',
            store: SOD.storeresultImage,   // same store GridPanel is using
            dock: 'top',
            displayInfo: true
        }], 
        items:[  Ext.create('Ext.view.View', {
            id:'resultview',
            autoHeight : false,
            store: SOD.storeresultImage,
            tpl: [
		'<tpl for=".">',
		'<div class="thumb-wrap" id="{score}">',
		'<div class="thumb"><a href="{url}" class="imagegroup" title="score:{score}"><img src="{url_thumb}" title="score:{score}"></a></div>',
		'<span class="x-editable1">{name} </span></div>',
		'</tpl>',
		'<div class="x-clear"></div>'
            ],
            multiSelect: false,            
            trackOver: true,
            autoScroll : true,
            height:515,
	    overItemCls: 'x-item-over',
            itemSelector: 'div.thumb-wrap',
            emptyText: 'No images to display',
            plugins: [
		Ext.create('Ext.ux.DataView.DragSelector', {}),
		Ext.create('Ext.ux.DataView.LabelEditor', {
                    dataIndex: 'name'
		})
            ],
            prepareData: function(data) {
                Ext.apply(data, {
                    shortName: Ext.util.Format.ellipsis(data.name, 15),
                    sizeString: Ext.util.Format.fileSize(data.size),
                    dateString: Ext.util.Format.date(data.lastmod, "m/d/Y g:i a")
                });
                return data;
            },
            listeners: {
                activate : {
                    fn : function (me, record, item, index, e, ePots) {
                        alert("d");
                    }
                }
            }
        })]
    });
 var storeFolders = Ext.create('Ext.data.TreeStore', {
        proxy: {
            type: 'ajax',
            url: Drupal.settings.basePath+'getnodes?tree=true'
        },
        root: {
            text: 'Image Gallery',
            id: '',
            expanded: true
        },
        folderSort: true,
        sorters: [{
            property: 'text',
            direction: 'ASC'
        }]
    });

    SOD.tree = Ext.create('Ext.tree.Panel', {
        id: 'tree',
        store: storeFolders,
        layout:'fit',
        title:'Dirctory',
        collapsible: true,
	collapseFirst:true,
	width:600,        
        listeners: {
            itemclick : {
                fn : function (view, record, item, index, event) {
                    var nodeId = record.data.id;
                    SOD.storeImage.proxy.url=Drupal.settings.basePath+'getnodeimages?node='+nodeId;
                    SOD.storeImage.load();
                    SOD.gallerypanel.dockedItems.items[1].moveFirst();
		},  
                load : {
                    fn : function () {
			jQuery('.x-grid-col-resizer-treecolumn-1038').hide();
                        SOD.tree.getRootNode().childNodes[1].childNodes[1].childNodes[5].expand();
              
                    }
                }
            }
        },
        viewConfig: {
            plugins: {
                ptype: 'treeviewdragdrop',
                appendOnly: true
            }
        }
    });
    
    var searchport = Ext.create('Ext.panel.Panel', {        
        layout:'border',
        width : "100%",
        title :"Search",
        items: [{
            region: 'west',
            split: true,
            width: '30%',
            layout:'fit',
	    expanded:false,
            items: [SOD.tree]
        },{
            region: 'center',
	    layout:'fit',
            width:'60%',         
            items: [SOD.gallerypanel]
        },]
    });
    var histotab= Ext.createWidget('tabpanel', { 
         activeTab: 0,
	 width : 1000,
	 height : "50%",
	 defaults :{
	     bodyPadding: 10
	 },
    items: [
        {
           id: 'chartCmp',
           title: 'By Year',
           xtype: 'chart',
           style: 'background:#fff',
           layout:'fit',
           animate: true,
	   shadow: true,
           store:SOD.storeHistogram,
           axes: [{
		type: 'Numeric',
		position: 'left',
		fields: ['countoffiles'],
		label: {
		    font: '8px Arial'
		},
		font: '8px Arial',
		title: 'Num of Files',
		grid: true,
		minimum: 0
	    }, {
		type: 'Category',
		position: 'bottom',
		fields: ['year'],
		title: ' Year'
	    }],
	     series: [{
		type: 'column',
		axis: 'left',
		highlight: true,
		label: {
		    display: 'insideEnd',
		    'text-anchor': 'middle',
		    field: 'countoffiles',
		    orientation: 'vertical',
		    color: '#ffc'
			  
		},
                renderer: function(sprite, record, attr, index, store) {
                       var colors = ['#9CC5C9','#8B0000','#D5544F','#5288DB','#4682B4','#008080','#00FF00','#708090','#2F4F4F','#9ACD32','#9370DB','#DB7093'];
                          return Ext.apply(attr, {
                            fill: colors[index % colors.length]
                            });
                 },
                 
                  listeners: {
                       itemmousedown: function(a,b,c,d,e){
                           SOD.yearvalue=a.value[0];
                           SOD.storeresultImage.proxy.url= Drupal.settings.basePath+'getservice?file='+SOD.imageurldefault+"&threshold="+Ext.getCmp('slider').getValue()+'&histo=false&year='+SOD.yearvalue;
			   SOD.storeHistogrambymonth.proxy.url=Drupal.settings.basePath+'getservice?file='+SOD.imageurldefault+"&threshold="+Ext.getCmp('slider').getValue()+'&histo=true&year='+SOD.yearvalue;
		        
	                   SOD.storeHistogrambymonth.load();
                           
                           SOD.storeresultImage.load();
                       var tab = Ext.getCmp('by-month');
                        histotab.setActiveTab(tab);
                         }
                  },
		xField: 'year',
		yField: 'countoffiles'
	    }]
        
            
           
        },
        {
           id: 'by-month',
           title: 'By Month',
           xtype: 'chart',
           style: 'background:#fff',
           animate: true,
	   shadow: true,
	   store:SOD.storeHistogrambymonth,
           axes: [{
		type: 'Numeric',
		position: 'left',
		fields: ['countoffiles'],
		label: {
		    font: '8px Arial'
		},
		font: '8px Arial',
		title: 'Num of Files',
		grid: true,
		minimum: 0
	    }, {
		type: 'Category',
		position: 'bottom',
		fields: ['year'],
		title: ' Month'
	    }],
	     series: [{
		type: 'column',
		axis: 'left',
		highlight: true,
		label: {
		    display: 'insideEnd',
		    'text-anchor': 'middle',
		    field: 'countoffiles',
		    orientation: 'vertical',
		    color: '#ffc'
			  
		},
                  renderer: function(sprite, record, attr, index, store) {
                       var colors = ['#9CC5C9','#8B0000','#D5544F','#5288DB','#4682B4','#008080','#00FF00','#708090','#2F4F4F','#9ACD32','#9370DB','#DB7093'];
                          return Ext.apply(attr, {
                            fill: colors[index % colors.length]
                            });
                 },
                  listeners: {
                       itemmousedown: function(a,b,c,d,e){
                         SOD.monthvalue=a.value[0];
                         SOD.storeresultImage.proxy.url= Drupal.settings.basePath+'getservice?file='+SOD.imageurldefault+"&threshold="+Ext.getCmp('slider').getValue()+'&histo=false&year='+SOD.yearvalue+'&month='+SOD.monthvalue;
			 SOD.storeHistogrambyday.proxy.url=Drupal.settings.basePath+'getservice?file='+SOD.imageurldefault+"&threshold="+Ext.getCmp('slider').getValue()+'&histo=true&year='+SOD.yearvalue+'&month='+SOD.monthvalue;
		         SOD.storeHistogrambyday.load();
                         SOD.storeresultImage.load();
                         var tab = Ext.getCmp('by-day');
                        histotab.setActiveTab(tab);
                         }
                  },
		xField: 'year',
		yField: 'countoffiles'
	    }]
        },
        {
           id: 'by-day',
           title: 'By Day',
           xtype: 'chart',
           style: 'background:#fff',
	   
           animate: true,
           shadow: true,
	   store:SOD.storeHistogrambyday,
           axes: [{
		type: 'Numeric',
		position: 'left',
		fields: ['countoffiles'],
		label: {
		    font: '8px Arial'
		},
		font: '8px Arial',
		title: 'Num of Files',
		grid: true,
		minimum: 0
	    }, {
		type: 'Category',
		position: 'bottom',
		fields: ['year'],
		title: ' Day'
	    }],
	     series: [{
		type: 'column',
		axis: 'left',
		highlight: true,
		label: {
		    display: 'insideEnd',
		    'text-anchor': 'middle',
		    field: 'countoffiles',
		    orientation: 'vertical',
		    color: '#ffc'
			  
		},
                  renderer: function(sprite, record, attr, index, store) {
                       var colors = ['#9CC5C9','#8B0000','#D5544F','#5288DB','#4682B4','#008080','#00FF00','#708090','#2F4F4F','#9ACD32','#9370DB','#DB7093'];
                          return Ext.apply(attr, {
                            fill: colors[index % colors.length]
                            });
                 },
                  listeners: {
                       itemmousedown: function(a,b,c,d,e){
                         }
                  },
		xField: 'year',
		yField: 'countoffiles'
	    }]
        }
    ]
    
});
     var resultport= Ext.create('Ext.panel.Panel', {
        width: '100%',
        height: '100%',
        title: 'Result',
        layout: 'border',
        items: [{
            title: 'Searched Image',
            region:'west',
            xtype: 'panel',
            margins: '5 0 0 5',
            width:'30%',
            height: '50%',
            layout: 'fit',
            items: [SOD.searchimage],
            collapsible: true,   // make collapsible
            layout: 'fit'    
        },{
            region: 'center',     // center region is required, no width/height specified
            xtype: 'panel',
            layout: 'fit',
            width:'70%',
            height: '50%',
            
            margins: '5 5 0 0',
            items: [resultpanel]
        },{
            region: 'south',     // position for region
            xtype: 'panel',
            width:'100%',
            height: '50%',
            split: true,         // enable resizing
            margins: '0 5 5 5', 
            layout: 'fit',
            items: [histotab] //title: 'Center Region',
            
        }]
    });
     SOD.tabpanel = Ext.createWidget('tabpanel', { 
	 activeTab: 0,
	 width : "100%",
	 height : 800,
	 renderTo:Ext.get('gallery'),
	 defaults :{
	     bodyPadding: 10
	 },
	 items: [searchport,resultport]
     });
});


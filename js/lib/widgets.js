var widgets = require('@jupyter-widgets/base');
var _ = require('lodash');
require('jquery');


// Custom Model. Custom widgets models must at least provide default values
// for model attributes, including
//
//  - `_view_name`
//  - `_view_module`
//  - `_view_module_version`
//
//  - `_model_name`
//  - `_model_module`
//  - `_model_module_version`
//
//  when different from the base class.

// When serialiazing the entire widget state for embedding, only values that
// differ from the defaults will be specified.
var FileUploadModel = widgets.DOMWidgetModel.extend({
    defaults: _.extend(widgets.DOMWidgetModel.prototype.defaults(), {
        _model_name: 'FileUploadModel',
        _view_name: 'FileUploadView',
        _model_module: 'ipyfileupload',
        _view_module: 'ipyfileupload',
        _model_module_version: '0.1.0',
        _view_module_version: '0.1.0',
    })
});

var MultiFileUploadModel = widgets.DOMWidgetModel.extend({
    defaults: _.extend(widgets.DOMWidgetModel.prototype.defaults(), {
        _model_name: 'MultiFileUploadModel',
        _view_name: 'MultiFileUploadView',
        _model_module: 'ipyfileupload',
        _view_module: 'ipyfileupload',
        _model_module_version: '0.1.0',
        _view_module_version: '0.1.0',
    })
});

var _getId = (function() {

    var cnt = 0;
    return function() {

        cnt += 1;
        return 'fileupload_' + cnt;
    }
})();

// Custom View. Renders the widget model.
var FileUploadView = widgets.DOMWidgetView.extend({
    render: function render() {
        FileUploadView.__super__.render.apply(this, arguments);
        var id = _getId();
        var label = this.model.get('label');
        this.model.on('change:label', this._handleLabelChange, this);
        var $label = $('<label />')
            .text(label)
            .addClass('btn btn-default')
            .attr('for', id)
            .appendTo(this.$el);

        $('<input />')
            .attr('type', 'file')
            .attr('id', id)
            .css('display', 'none')
            .appendTo($label);
    },

    _handleLabelChange: function() {
        var label = this.model.get('label');
        this.$el.children("label").contents().first().replaceWith(label);
    },

    events: {
        'change': '_handleFileChange'
    },

    _handleFileChange: function _handleFileChange(ev) {

        var file = ev.target.files[0];
        var that = this;
        if (file) {
            var fileReader = new FileReader();
            fileReader.onload = function fileReaderOnload() {

                that.model.set('data_base64', fileReader.result);
                that.touch();
            };
            fileReader.readAsDataURL(file);
        } else {
            that.send({ event: 'Unable to open file.' });
        }
        that.model.set('filename', file.name);
        that.touch();
    }
});

// Custom View. Renders the widget model.
var MultiFileUploadView = widgets.DOMWidgetView.extend({
    render: function render() {
        MultiFileUploadView.__super__.render.apply(this, arguments);
        var id = _getId();
        var label = this.model.get('label');
        this.model.on('change:label', this._handleLabelChange, this);
        var $label = $('<label />')
            .text(label)
            .addClass('btn btn-default')
            .attr('for', id)
            .appendTo(this.$el);

        $('<input />')
            .attr('type', 'file')
            .attr('id', id)
            .attr('multiple', 'multiple')
            .css('display', 'none')
            .appendTo($label);
    },

    _handleLabelChange: function() {
        var label = this.model.get('label');
        this.$el.children("label").contents().first().replaceWith(label);
    },

    events: {
        'change': '_handleFileChange'
    },

    readFile: function readFile(file, uploading) {
        return new Promise(function(resolve, reject) {
            reader = new FileReader();
            console.log(file);
            reader.onload = function fileReaderOnload(e) {
                console.log('callback');
                uploading[file.name] = e.target.result;
                //that.model.set('data_base64', fileReader.result);
                //that.touch();
                console.log(uploading);
                resolve(uploading);
            }
            reader.onerror = function fileReadOnError(e) {
                reject(e);
            }
            reader.readAsDataURL(file);
        });
    },

    _handleFileChange: function _handleFileChange(ev) {
        var files = ev.target.files;
        console.log(files);
        var that = this;
        var uploading = {};
        var readers = [];
        var promises = [];
        (function(files) {
            for (var i = 0; i < files.length; i++) {
                promises.push(that.readFile(files[i], uploading));
                /*
                (function(file) {
                    readers.push(new FileReader());
                    console.log(i);
                    console.log(file + "dsfgsdfg0");
                    readers[i].onload = function fileReaderOnload(e) {
                        console.log('callback', i);
                        uploading[file.name] = e.target.result;
                        //that.model.set('data_base64', fileReader.result);
                        //that.touch();
                        console.log(uploading);
                    }
                    readers[i].readAsArrayBuffer(file);
                })(files[i]);
                */
            }
        })(files);

        Promise.all(promises).then(function() {
            console.log(uploading);
            that.model.set('base64_files', uploading);
            that.touch();
        });
    }
});




module.exports = {
    FileUploadModel: FileUploadModel,
    FileUploadView: FileUploadView,
    MultiFileUploadModel: MultiFileUploadModel,
    MultiFileUploadView: MultiFileUploadView
};
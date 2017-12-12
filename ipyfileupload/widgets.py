import base64

import ipywidgets as widgets
from traitlets import Unicode, Bytes



@widgets.register
class FileUploadWidget(widgets.DOMWidget):
    '''File Upload Widget.
    This widget provides file upload using `FileReader`.
    '''
    _view_name = Unicode('FileUploadView').tag(sync=True)
    _model_name = Unicode('FileUploadModel').tag(sync=True)

    _view_module = Unicode('ipyfileupload').tag(sync=True)
    _model_module = Unicode('ipyfileupload').tag(sync=True)

    _view_module_version = Unicode('^0.1.0').tag(sync=True)
    _model_module_version = Unicode('^0.1.0').tag(sync=True)

    label = Unicode(help='Label on button.').tag(sync=True)
    filename = Unicode(help='Filename of `data`.').tag(sync=True)
    data_base64 = Unicode(help='File content, base64 encoded.'
                                    ).tag(sync=True)
    data = Bytes(help='File content.')

    def __init__(self, label="Browse", *args, **kwargs):
        super(FileUploadWidget, self).__init__(*args, **kwargs)
        self._dom_classes += ('widget_item', 'btn-group')
        self.label = label

    def _data_base64_changed(self, *args):
        self.data = base64.b64decode(self.data_base64.split(',', 1)[1])
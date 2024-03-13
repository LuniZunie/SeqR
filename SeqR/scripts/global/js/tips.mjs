export default {
  help: {
    top: {
      import: 'Import',
      delete_data: 'Delete ALL data',
      confirm_delete_data: 'Confirm you want to delete ALL data',
      draw: 'Graph',
      export: 'Export',
    },
    side: {
      bottom: {
        add_group: 'New group',
        auto_group: 'Auto group',
        clean_groups: 'Delete duplicate and empty groups',
        remove_all_groups: 'Delete ALL groups',
      },
      group: {
        title: 'Rename',
        edit: 'Edit data',
        format: 'Group format',
        remove: 'Delete group',
        data: {
          content: 'Format',
          copy: 'Copy',
          paste: 'Paste',
        }
      }
    },
    content: {
      text_editor: {
        save: 'Load data',
      },
      file_data: {
        delete_file_data: 'Delete file data',
        confirm_delete_file_data: 'Confirm you want to delete file data',
      },
    },
  },
  error: {
    content: {
      text_editor: {
        file_name: {
          non_ascii: 'File name cannot contain non-ASCII characters',
          invalid_characters: 'File name cannot contain the following characters:<br><code>NUL \\ / : * ? " < > |</code>',
          invalid_start: 'File name cannot start with a whitespace character',
          invalid_end: 'File name cannot end with a whitespace character or a period',
        }
      },
    },
  },
};
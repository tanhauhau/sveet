import arrow_undo_20_regular from '@fluentui/svg-icons/icons/arrow_undo_20_regular.svg';
import arrow_redo_20_regular from '@fluentui/svg-icons/icons/arrow_redo_20_regular.svg';

export const actions = [
  { title: 'Undo', icon: arrow_undo_20_regular, action: notImplemented },
  { title: 'Redo', icon: arrow_redo_20_regular, action: notImplemented },
]

function notImplemented() {
  alert('Feature not implemented!');
}

import { Modal } from "antd";
import i18n from "i18next";

const wrapper = (_type, value, title) => {
  const custom = {
    type: "",
    title: "",
  };

  switch (_type) {
    case "error":
      custom.type = Modal.error;
      custom.title = i18n.t('modal_error');
      break;
    case "warning":
      custom.type = Modal.warning;
      custom.title = i18n.t('modal_warning');
      break;
    case "success":
      custom.type = Modal.success;
      custom.title = i18n.t('modal_success');
      break;
    default:
      custom.type = Modal.info;
      custom.title = i18n.t('modal_info');
  }

  return custom.type({
    title: title ? title : custom.title,
    content: value,
  });
};

/**
 * Success modal
 * @param {string} value
 * @param {string} title
 */
const error = (value, title) => {
  return wrapper("error", value, title);
};

/**
 * Warning modal
 * @param {string} value
 * @param {string} title
 */
const warning = (value, title) => {
  return wrapper("warning", value, title);
};

/**
 * Success modal
 * @param {string} value
 * @param {string} title
 */
const success = (value, title) => {
  return wrapper("success", value, title);
};

/**
 * Information modal
 * @param {string} value
 * @param {string} title
 */
const info = (value, title) => {
  return wrapper("info", value, title);
};

export default { error, warning, success, info };

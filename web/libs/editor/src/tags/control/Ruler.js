import { types } from "mobx-state-tree";

import ControlBase from "./Base";
import Registry from "../../core/Registry";
import { AnnotationMixin } from "../../mixins/AnnotationMixin";
import SeparatedControlMixin from "../../mixins/SeparatedControlMixin";
import { ToolManagerMixin } from "../../mixins/ToolManagerMixin";

/**
 * The `Ruler` tag is used to add ruler lines to an image for measuring distances and comparing proportions.
 * Users can draw lines on the image, and the tool will display the length of each line.
 * If multiple lines are drawn, it will also display the ratio between them (e.g., 1:2, 1:2:3).
 *
 * Use with the following data types: image.
 *
 * @example
 * <!--Basic labeling configuration for adding ruler lines to an image -->
 * <View>
 *   <Ruler name="ruler-1" toName="img-1" />
 *   <Image name="img-1" value="$img" />
 * </View>
 * @name Ruler
 * @meta_title Ruler Tag for Measuring Distances in Images
 * @meta_description Customize Label Studio with the Ruler tag to measure distances and compare proportions in images.
 * @param {string} name                   - Name of the element
 * @param {string} toName                 - Name of the image to label
 */
const TagAttrs = types.model({
  toname: types.maybeNull(types.string),
});

const Model = types
  .model({
    type: "ruler",
  })
  .volatile(() => ({
    toolNames: ["Ruler"],
  }));

const RulerModel = types.compose(
  "RulerModel",
  ControlBase,
  AnnotationMixin,
  SeparatedControlMixin,
  TagAttrs,
  Model,
  ToolManagerMixin,
);

const HtxView = () => {
  return null;
};

Registry.addTag("ruler", RulerModel, HtxView);

export { HtxView, RulerModel };


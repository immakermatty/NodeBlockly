/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2012 Google Inc.
 * https://developers.google.com/blockly/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Object representing a UI bubble.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.Line');

goog.require('Blockly.Touch');
goog.require('Blockly.Workspace');
goog.require('goog.dom');
goog.require('goog.math');
goog.require('goog.math.Coordinate');
goog.require('goog.userAgent');


/**
 * Class for UI bubble.
 * @param {!Blockly.WorkspaceSvg} workspace The workspace on which to draw the
 *     bubble.
 * @param {!goog.math.Coordinate} anchorXY Absolute position of bubble's anchor
 *     point.
 * @constructor
 */
Blockly.Line = function (workspace, anchorXY) {

    var bubbleWidth = Blockly.Line.ANCHOR_SIZE;
    var bubbleHeight = Blockly.Line.ANCHOR_SIZE;

    this.workspace_ = workspace;


    //var angle = Blockly.Line.ARROW_ANGLE;
    //if (this.workspace_.RTLMod ? false : this.workspace_.RTL) {
    //    angle = -angle;
    //}
    //this.arrow_radians_ = goog.math.toRadians(angle);

    this.arrow_radians_ = 0;

    var canvas = workspace.getBubbleCanvas();
    canvas.appendChild(this.createDom_());

    this.setAnchorLocation(anchorXY);
    //if (!bubbleWidth || !bubbleHeight) {
    //    var bBox = /** @type {SVGLocatable} */ (this.content_).getBBox();
    //    bubbleWidth = bBox.width + 2 * Blockly.Line.BORDER_WIDTH;
    //    bubbleHeight = bBox.height + 2 * Blockly.Line.BORDER_WIDTH;
    //}
    this.setBubbleSize(bubbleWidth, bubbleHeight);

    this.setColour('#000000');

    // Render the bubble.
    this.positionBubble_();
    this.renderArrow_();
    this.rendered_ = true;


};

/**
 * Width of the border around the bubble.
 */
Blockly.Line.BORDER_WIDTH = 5;

/**
 * Determines the thickness of the base of the arrow in relation to the size
 * of the bubble.  Higher numbers result in thinner arrows.
 */
Blockly.Line.ARROW_THICKNESS = 3;

///**
// * The number of degrees that the arrow bends counter-clockwise.
// */
//Blockly.Line.ARROW_ANGLE = -50;

/**
 * The sharpness of the arrow's bend.  Higher numbers result in smoother arrows.
 */
Blockly.Line.ARROW_BEND = 3;

/**
 * Distance between arrow point and anchor point.
 */
Blockly.Line.ANCHOR_RADIUS = 0;

/**
 * The size of the Anchor.
 */
Blockly.Line.ANCHOR_SIZE = 10;

/**
 * Wrapper function called when a mouseUp occurs during a drag operation.
 * @type {Array.<!Array>}
 * @private
 */
Blockly.Line.onMouseUpWrapper_ = null;

/**
 * Wrapper function called when a mouseMove occurs during a drag operation.
 * @type {Array.<!Array>}
 * @private
 */
Blockly.Line.onMouseMoveWrapper_ = null;

/**
 * Function to call on resize of bubble.
 * @type {Function}
 */
Blockly.Line.prototype.resizeCallback_ = null;

/**
 * Flag to stop incremental rendering during construction.
 * @private
 */
Blockly.Line.prototype.rendered_ = false;

/**
 * Absolute coordinate of anchor point, in workspace coordinates.
 * @type {goog.math.Coordinate}
 * @private
 */
Blockly.Line.prototype.anchorXY_ = null;

/**
 * Relative X coordinate of bubble with respect to the anchor's centre,
 * in workspace units.
 * In RTL mode the initial value is negated.
 * @private
 */
Blockly.Line.prototype.relativeLeft_ = 0;

/**
 * Relative Y coordinate of bubble with respect to the anchor's centre.
 * @private
 */
Blockly.Line.prototype.relativeTop_ = 0;

/**
 * Width of bubble.
 * @private
 */
Blockly.Line.prototype.width_ = 0;

/**
 * Height of bubble.
 * @private
 */
Blockly.Line.prototype.height_ = 0;

/**
 * Automatically position and reposition the bubble.
 * @private
 */
Blockly.Line.prototype.autoLayout_ = true;

/**
 * Create the bubble's DOM.
 * @return {!Element} The bubble's SVG group.
 * @private
 */
Blockly.Line.prototype.createDom_ = function () {

    /* Create the bubble.  Here's the markup that will be generated:
    <g>
      <g filter="url(#blocklyEmbossFilter837493)">
        <path d="... Z" />
        <rect class="blocklyDraggable" rx="8" ry="8" width="180" height="180"/>
      </g>
      <g transform="translate(165, 165)" class="blocklyResizeSE">
        <polygon points="0,15 15,15 15,0"/>
        <line class="blocklyResizeLine" x1="5" y1="14" x2="14" y2="5"/>
        <line class="blocklyResizeLine" x1="10" y1="14" x2="14" y2="10"/>
      </g>
    </g>
    */
    this.bubbleGroup_ = Blockly.utils.createSvgElement('g', {}, null);
    var filter =
        { 'filter': 'url(#' + this.workspace_.options.embossFilterId + ')' };
    if (goog.userAgent.getUserAgentString().indexOf('JavaFX') != -1) {
        // Multiple reports that JavaFX can't handle filters.  UserAgent:
        // Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.44
        //     (KHTML, like Gecko) JavaFX/8.0 Safari/537.44
        // https://github.com/google/blockly/issues/99
        filter = {};
    }
    var bubbleEmboss = Blockly.utils.createSvgElement('g',
        filter, this.bubbleGroup_);
    this.bubbleArrow_ = Blockly.utils.createSvgElement('path', {}, bubbleEmboss);
    this.bubbleBack_ = Blockly.utils.createSvgElement('rect',
        {
            'class': 'blocklyDraggable',
            'x': 0,
            'y': 0,
            'rx': Blockly.Line.BORDER_WIDTH,
            'ry': Blockly.Line.BORDER_WIDTH
        },
        bubbleEmboss); 
    return this.bubbleGroup_;
};

/**
 * Return the root node of the bubble's SVG group.
 * @return {Element} The root SVG node of the bubble's group.
 */
Blockly.Line.prototype.getSvgRoot = function () {
    return this.bubbleGroup_;
};

/**
 * Expose the block's ID on the bubble's top-level SVG group.
 * @param {string} id ID of block.
 */
Blockly.Line.prototype.setSvgId = function (id) {
    if (this.bubbleGroup_.dataset) {
        this.bubbleGroup_.dataset.blockId = id;
    }
};


/**
 * Show the context menu for this bubble.
 * @param {!Event} _e Mouse event.
 * @private
 */
Blockly.Line.prototype.showContextMenu_ = function (_e) {
    // NOP on bubbles, but used by the bubble dragger to pass events to
    // workspace comments.
};

/**
 * Get whether this bubble is deletable or not.
 * @return {boolean} True if deletable.
 * @package
 */
Blockly.Line.prototype.isDeletable = function () {
    return false;
};


/**
 * Register a function as a callback event for when the bubble is resized.
 * @param {!Function} callback The function to call on resize.
 */
Blockly.Line.prototype.registerResizeEvent = function (callback) {
//NOP
};

/**
 * Move this bubble to the top of the stack.
 * @return {!boolean} Whether or not the bubble has been moved.
 * @private
 */
Blockly.Line.prototype.promote_ = function () {
    var svgGroup = this.bubbleGroup_.parentNode;
    if (svgGroup.lastChild !== this.bubbleGroup_) {
        svgGroup.appendChild(this.bubbleGroup_);
        return true;
    }
    return false;
};

/**
 * Update the arrow and bubble accordingly.
 * @param {!goog.math.Coordinate} xy Absolute location.
 */
Blockly.Line.prototype.setAnchorLocation = function (xy) {

    if (this.anchorXY_) {

        var dx = xy.x - this.anchorXY_.x;
        var dy = xy.y - this.anchorXY_.y;

        this.relativeTop_ -= dy;
        this.relativeLeft_ -= dx;
    }
    this.anchorXY_ = xy;

    this.renderArrow_();

    //if (this.rendered_) {
    //    this.positionBubble_();
    //}
};


/**
 * Update the arrow and bubble accordingly.
 * @param {!goog.math.Coordinate} xy Absolute location.
 */
Blockly.Line.prototype.setTipLocation = function (xy) {

    xy.y -= Blockly.Line.ANCHOR_SIZE / 2;

    if (this.anchorXY_) {

        var dx = xy.x - this.anchorXY_.x;
        var dy = xy.y - this.anchorXY_.y;

        this.relativeTop_ = dy;
        this.relativeLeft_ = dx;
    }
    //this.anchorXY_ = xy;

    this.renderArrow_();

    if (this.rendered_) {
        this.positionBubble_();
    }
};

/**
 * Move the bubble to a location relative to the anchor's centre.
 * @private
 */
Blockly.Line.prototype.positionBubble_ = function () {

    var left = this.anchorXY_.x;
    if (this.workspace_.RTLMod ? false : this.workspace_.RTL) {
        left -= this.relativeLeft_ + this.width_;
    } else {
        left += this.relativeLeft_;
    }
    var top = this.relativeTop_ + this.anchorXY_.y;
    this.moveTo(left, top);
};

/**
 * Move the bubble group to the specified location in workspace coordinates.
 * @param {number} x The x position to move to.
 * @param {number} y The y position to move to.
 * @package
 */
Blockly.Line.prototype.moveTo = function (x, y) {
    this.bubbleGroup_.setAttribute('transform', 'translate(' + x + ',' + y + ')');
};

/**
 * Get the dimensions of this bubble.
 * @return {!Object} Object with width and height properties.
 */
Blockly.Line.prototype.getBubbleSize = function () {
    return { width: this.width_, height: this.height_ };
};

/**
 * Size this bubble.
 * @param {number} width Width of the bubble.
 * @param {number} height Height of the bubble.
 */
Blockly.Line.prototype.setBubbleSize = function (width, height) {
    var doubleBorderWidth = 2 * Blockly.Line.BORDER_WIDTH;
    // Minimum size of a bubble.
    width = Math.max(width, doubleBorderWidth);
    height = Math.max(height, doubleBorderWidth);
    this.width_ = width;
    this.height_ = height;
    this.bubbleBack_.setAttribute('width', width);
    this.bubbleBack_.setAttribute('height', height);
    if (this.resizeGroup_) {
        if (this.workspace_.RTLMod ? false : this.workspace_.RTL) {
            // Mirror the resize group.
            var resizeSize = 2 * Blockly.Line.BORDER_WIDTH;
            this.resizeGroup_.setAttribute('transform', 'translate(' +
                resizeSize + ',' + (height - doubleBorderWidth) + ') scale(-1 1)');
        } else {
            this.resizeGroup_.setAttribute('transform', 'translate(' +
                (width - doubleBorderWidth) + ',' +
                (height - doubleBorderWidth) + ')');
        }
    }
    if (this.rendered_) {
        this.positionBubble_();
        this.renderArrow_();
    }
    // Allow the contents to resize.
    if (this.resizeCallback_) {
        this.resizeCallback_();
    }
};

/**
 * Draw the arrow between the bubble and the origin.
 * @private
 */
Blockly.Line.prototype.renderArrow_ = function () {
    this.arrow_radians_ = goog.math.toRadians(angle);

    var steps = [];
    // Find the relative coordinates of the center of the bubble.
    var relBubbleX = this.width_ / 2;
    var relBubbleY = this.height_ / 2;
    // Find the relative coordinates of the center of the anchor.
    var relAnchorX = -this.relativeLeft_;
    var relAnchorY = -this.relativeTop_;

    var dx = relBubbleX - relAnchorX;
    var dy = relAnchorY - relBubbleY;
    this.arrow_radians_ = Math.atan((dx > 0 ? dy :
        dy > 0 ? dy - 5 * dx : dy + 5 * dx) / (dx > 0 ? dx : -dx));


    if (relBubbleX == relAnchorX && relBubbleY == relAnchorY) {
        // Null case.  Bubble is directly on top of the anchor.
        // Short circuit this rather than wade through divide by zeros.
        steps.push('M ' + relBubbleX + ',' + relBubbleY);
    } else {
        // Compute the angle of the arrow's line.
        var rise = relAnchorY - relBubbleY;
        var run = relAnchorX - relBubbleX;
        if (this.workspace_.RTLMod ? false : this.workspace_.RTL) {
            run *= -1;
        }
        var hypotenuse = Math.sqrt(rise * rise + run * run);
        var angle = Math.acos(run / hypotenuse);
        if (rise < 0) {
            angle = 2 * Math.PI - angle;
        }
        // Compute a line perpendicular to the arrow.
        var rightAngle = angle + Math.PI / 2;
        if (rightAngle > Math.PI * 2) {
            rightAngle -= Math.PI * 2;
        }
        var rightRise = Math.sin(rightAngle);
        var rightRun = Math.cos(rightAngle);

        // Calculate the thickness of the base of the arrow.
        var bubbleSize = this.getBubbleSize();
        var thickness = (bubbleSize.width + bubbleSize.height) /
            Blockly.Line.ARROW_THICKNESS;
        thickness = Math.min(thickness, bubbleSize.width, bubbleSize.height) / 4;

        // Back the tip of the arrow off of the anchor.
        var backoffRatio = 1 - Blockly.Line.ANCHOR_RADIUS / hypotenuse;
        relAnchorX = relBubbleX + backoffRatio * run;
        relAnchorY = relBubbleY + backoffRatio * rise;

        // Coordinates for the base of the arrow.
        var baseX1 = relBubbleX + thickness * rightRun;
        var baseY1 = relBubbleY + thickness * rightRise;
        var baseX2 = relBubbleX - thickness * rightRun;
        var baseY2 = relBubbleY - thickness * rightRise;

        // Distortion to curve the arrow.
        var swirlAngle = angle + this.arrow_radians_;
        if (swirlAngle > Math.PI * 2) {
            swirlAngle -= Math.PI * 2;
        }
        var swirlRise = Math.sin(swirlAngle) *
            hypotenuse / Blockly.Line.ARROW_BEND;
        var swirlRun = Math.cos(swirlAngle) *
            hypotenuse / Blockly.Line.ARROW_BEND;

        steps.push('M' + baseX1 + ',' + baseY1);
        steps.push('C' + (baseX1 + swirlRun) + ',' + (baseY1 + swirlRise) +
            ' ' + relAnchorX + ',' + relAnchorY +
            ' ' + relAnchorX + ',' + relAnchorY);
        steps.push('C' + relAnchorX + ',' + relAnchorY +
            ' ' + (baseX2 + swirlRun) + ',' + (baseY2 + swirlRise) +
            ' ' + baseX2 + ',' + baseY2);
    }
    steps.push('z');
    this.bubbleArrow_.setAttribute('d', steps.join(' '));
};

/**
 * Change the colour of a bubble.
 * @param {string} hexColour Hex code of colour.
 */
Blockly.Line.prototype.setColour = function (hexColour) {
    this.bubbleBack_.setAttribute('fill', hexColour);
    this.bubbleArrow_.setAttribute('fill', hexColour);
};

/**
 * Dispose of this bubble.
 */
Blockly.Line.prototype.dispose = function () {
    // Dispose of and unlink the bubble.
    goog.dom.removeNode(this.bubbleGroup_);
    this.bubbleGroup_ = null;
    this.bubbleArrow_ = null;
    this.bubbleBack_ = null;
    this.workspace_ = null;
};

/**
 * Move this bubble during a drag, taking into account whether or not there is
 * a drag surface.
 * @param {?Blockly.BlockDragSurfaceSvg} dragSurface The surface that carries
 *     rendered items during a drag, or null if no drag surface is in use.
 * @param {!goog.math.Coordinate} newLoc The location to translate to, in
 *     workspace coordinates.
 * @package
 */
Blockly.Line.prototype.moveDuringDrag = function (dragSurface, newLoc) {
  //NOP
};

/**
 * Return the coordinates of the top-left corner of this bubble's body relative
 * to the drawing surface's origin (0,0), in workspace units.
 * @return {!goog.math.Coordinate} Object with .x and .y properties.
 */
Blockly.Line.prototype.getRelativeToSurfaceXY = function () {
    return new goog.math.Coordinate(
        this.anchorXY_.x + this.relativeLeft_,
        this.anchorXY_.y + this.relativeTop_);
};

/**
 * Set whether auto-layout of this bubble is enabled.  The first time a bubble
 * is shown it positions itself to not cover any blocks.  Once a user has
 * dragged it to reposition, it renders where the user put it.
 * @param {boolean} enable True if auto-layout should be enabled, false
 *     otherwise.
 * @package
 */
Blockly.Line.prototype.setAutoLayout = function (enable) {
    this.autoLayout_ = enable;
};


/**
 * Lowpass feedback comb filter implementation.
 *
 * Based on the implementation used in the Freeverb algorithm.
 * http://en.wikipedia.org/wiki/Comb_filter
 * https://ccrma.stanford.edu/~jos/pasp/Lowpass_Feedback_Comb_Filter.html
 *
 * @param {AudioContext} context
 * @param {number} delay
 * @param {number} feedback
 * @param {number} damping
 * @param {number} cutoff
 */

function Comb (context, delay, feedback, damping, cutoff) {
  this.input = context.createGainNode();
  this.output = context.createGainNode();

  // Internal AudioNodes
  this._delay = context.createDelayNode();
  this._damping = context.createGainNode();
  this._filter = context.createBiquadFilter();
  this._feedback = context.createGainNode();

  // AudioNode graph routing
  this.input.connect(this._delay);
  this._delay.connect(this._damping);
  this._damping.connect(this.output);

  this._damping.connect(this._filter);
  this._filter.connect(this._feedback);
  this._feedback.connect(this.input);

  // Defaults
  this._delay.delayTime.value   = delay     || this.meta.delay.defaultValue;
  this._feedback.gain.value     = feedback  || this.meta.feedback.defaultValue;
  this._damping.gain.value      = damping   || this.meta.damping.defaultValue;
  this._filter.frequency.value  = cutoff    || this.meta.damping.defaultValue;

  // Prevent positive feedback loops
  if (this.feedback * this.damping >= 1.0) {
    throw new Error("These parameter values will create a positive feedback loop.");
  }
}

Comb.prototype = Object.create(null, {

  /**
   * AudioNode prototype `connect` method.
   *
   * @param {AudioNode} dest
   */

  connect: {
    value: function (dest) {
      this.output.connect(dest);
    }
  },

  /**
   * AudioNode prototype `disconnect` method.
   */

  disconnect: {
    value: function () {
      this.output.disconnect();
    }
  },

  /**
   * Module parameter metadata.
   */

  meta: {
    value: {
      delay: {
        min: 0,
        max: 3,
        defaultValue: 0.027,
        type: "pot"
      },
      feedback: {
        min: 0,
        max: 1,
        defaultValue: 0.84,
        type: "pot"
      },
      damping: {
        min: 0,
        max: 1,
        defaultValue: 0.52,
        type: "pot"
      },
      cutoff: {
        min: 0,
        max: 22050,
        defaultValue: 3000,
        type: "pot"
      }
    }
  },

  /**
   * Public delay parameter
   */

  delay: {
    enumerable: true,
    get: function () { return this._delay.delayTime.value; },
    set: function (value) {
      this._delay.delayTime.setValueAtTime(value, 0);
    }
  },

  /**
   * Public feedback parameter
   */

  feedback: {
    enumerable: true,
    get: function () { return this._feedback.gain.value; },
    set: function (value) {
      this._feedback.gain.setValueAtTime(value, 0);
    }
  },

  /**
   * Public damping parameter
   */

  damping: {
    enumerable: true,
    get: function () { return this._damping.gain.value; },
    set: function (value) {
      this._damping.gain.setValueAtTime(value, 0);
    }
  },

  /**
   * Public cutoff parameter
   */

  cutoff: {
    enumerable: true,
    get: function () { return this._filter.frequency.value; },
    set: function (value) {
      this._filter.frequency.setValueAtTime(value, 0);
    }
  }

});

/**
 * Exports.
 */

module.exports = Comb;

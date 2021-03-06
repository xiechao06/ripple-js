import booleanOps from './op/boolean';
import objectOps from './op/object';
import numberOps from './op/number';
import listOps from './op/list';

const _uniqueId = function _uniqueId() {
  let i = 1;
  return function (prefix='') {
    return prefix + i++;
  };
}();

const _isEmptyObj = function _isEmptyObj(obj) {
  for(const key in obj) {
    if(obj.hasOwnProperty(key))
      return false;
  }
  return true;
};

const _objectValues = function _objectValues(obj) {
  if (Object.values) {
    return Object.values(obj);
  }
  const values = [];
  for (let key in obj){
    if (obj.hasOwnProperty(key)) {
      values.push(obj[key]);
    }
  }
  return values;
};

/**
 * @constructor
 *
 * @desc A Slot could be created in 2 methods:
 *
 *  * new Slot(value)
 *
 *  this will make a data slot
 *
 *  * new Slot(valueFunc, followings)
 *
 *  this will make a follower slot, where followings is an Array.
 *  if the element (say *following*) in observables is a:
 *
 *    * Slot
 *
 *      if *following* changed, *follower* will be re-evaludated by executing *valueFunc*,
 *      following.val() will be used as valueFunc's argument.
 *      its new value is the return value of *valueFunc*, and change will be propogated to
 *      *follower*'s followers.
 *
 *    * not Slot
 *
 *      when *follower* is re-evaluated, following will be used as *valueFunc*'s argument directly.
 *
 *  and valueFunc will accept 2 parameters:
 *
 *    * the current value of observables
 *    * mutation process context, it has two keys:
 *
 *      * roots - the mutation process roots, namely, those changed by clients (api caller)
 *        directly
 *
 *      * involved - the observed involed in this mutation process
 *
 *      the context is very useful if the evaluation function needs to return value
 *      according to which of its followings mutated
 *
 *  let's see two example:
 *
 *  ```javascript
 *
 *  const $$following = Slot(1);
 *  const $$follower = Slot((following, n) => following + n, [$$following, 2]);
 *  console.log($$follower.val()); // output 3, since n is always 2
 *
 *  $$following.inc();
 *  console.log($$follower.val()); // output 4, since n is always 2
 *  ```
 *
 *  ```javascript
 *
 *  const $$a = Slot(1).tag('a');
 *  const $$b = Slot(([a]) => a + 1, [$$a]).tag('b');
 *  const $$c = Slot(2).tag('c');
 *  const $$d = Slot(function ([a, b], {roots, involved}) {
 *    console.log(roots.map(it => it.tag())); // output [a]
 *    console.log(involved.map(it => it.tag())); // output [b]
 *    return a + b;
 *  });
 *
 *  // a is root of mutation proccess, and c is not changed in this mutation proccess
 *  $$a.inc();
 *
 *  ```
 *
 * */
export const Slot = function Slot(...args) {
  if (!(this instanceof Slot)) {
    return new Slot(...args);
  }
  this._id = _uniqueId();
  this._changeCbs = [];
  this._followings = [];
  this._followerMap = {};
  // offsprings are all direct or indirect followers
  this._offspringMap = {};
  this._offspringLevels = [];
  this._tag = '';
  Object.defineProperty(this, 'token', {
    get: function get() {
      return this._tag + '-' + this._id;
    }
  });
  Object.defineProperty(this, 'followings', {
    get: function get() {
      return this._followings;
    }
  });
  Object.defineProperty(this, 'followers', {
    get: function get() {
      return _objectValues(this._followerMap);
    }
  });
  if (args.length <= 1) {
    this._value = args[0];
  } else {
    const [valueFunc, followings, eager] = args;
    this.follow(valueFunc, followings, eager);
  }
};

/**
 * test if slot observes others
 * @return {boolean} true if it observes others, else false
 * */
Slot.prototype.isTopmost = function isTopmost() {
  return !this._followings.length;
};

/**
 * Set/get tag of slot, useful when debugging.
 *
 * @example
 * // set tag will return this
 * const $$s = Slot('foo').tag('bar');
 * console.log($$s.tag()); // output bar
 *
 * @param {(string|undefined)} v - if is string, set the tag of slot and return this,
 * else return the tag
 * @return {(string|Slot)}
 * */
Slot.prototype.tag = function tag(v) {
  if (v == void 0) {
    return this._tag;
  }
  this._tag = v;
  return this;
};

/**
 * set a handler to Slot to test if slot is mutated, here is an example:
 *
 * @example
 * let $$s1 = Slot(true);
 * let $$s2 = Slot(false);
 *
 * let $$s3 = Slot((s1, s2) => s1 && s2, [$$s1, $$s2])
 * .mutationTester((oldV, newV) => oldV != newV);
 *
 * $$s4 = $$s3.makeFollower((s3) => !s3)
 * .change(function () {
 *    console.log('s4 changed!');
 * });
 *
 * // $$s2 will be changed to true, but $$s3 is not changed,
 * // neither $$s4 will be changed
 * $$s2.toggle();
 *
 *
 * @param {function} tester - a handler to test if slot is changed in one mutation
 * process, if a slot finds all its dependents are unmutation, the mutation process
 * stops from it.
 * A propriate tester will improve the performance dramatically sometimes.
 *
 * it access slot as *this* and slot's new value and old value as arguments,
 * and return true if slot is changed in mutation process, else false.
 *
 * */
Slot.prototype.mutationTester = function mutationTester(tester) {
  this._mutationTester = tester;
  return this;
};

/**
 * add a change handler
 *
 * !!!Warning, this is a very dangerous operation if you modify slots in
 * change handler, consider the following scenario:
 *
 * ```javascript
 *  let $$s1 = Slot(1);
 *  let $$s2 = $$s1.makeFollower(it => it * 2);
 *  let $$s3 = $$s1.makeFollower(it => it * 3);
 *  $$s2.change(function () {
 *    $$s1.val(3); // forever loop
 *  ));
 *
 *  $$s1.val(2);
 * ```
 *
 *
 *  as a thumb of rule, don't set value for followings in change handler
 *
 * @param {function} proc - it will be invoked when slot is mutated in one
 * mutation process the same order as it is added, it accepts the following
 * parameters:
 *
 *   * new value of Slot
 *   * the old value of Slot
 *   * the mutation context
 *
 * for example, you could refresh the UI, when ever the final view changed
 *
 * @return {Slot} this
 *
 * */
Slot.prototype.change = function (proc) {
  this._changeCbs.push(proc);
  return this;
};

/**
 * remove the change handler
 *
 * @see {@link Slot#change}
 * */
Slot.prototype.offChange = function (proc) {
  this._changeCbs = this._changeCbs.filter(cb => cb != proc);
};

Slot.prototype.clearChangeCbs = function clearChangeCbs() {
  this._changeCbs = [];
};

/**
 * detach the target slot from its followings, and let its followers
 * connect me(this), just as if slot has been eliminated after the detachment.
 * this method is very useful if you want to change the dependent graph
 *
 * !!NOTE this method will not re-evaluate the slot and starts the mutation process
 * at once, so remember to call touch at last if you want to start a mutaion process
 *
 * @param {Slot} targetSlot
 * @return {Slot} this
 *
 * */
Slot.prototype.override = function override(targetSlot) {
  for (let following of targetSlot._followings) {
    delete following._followerMap[targetSlot._id];
  }
  for (let followerId in targetSlot._followerMap) {
    let follower = targetSlot._followerMap[followerId];
    this._followerMap[followerId] = follower;
    for (let i = 0; i < follower._followings.length; ++i) {
      if (follower._followings[i]._id == targetSlot._id) {
        follower._followings[i] = this;
        break;
      }
    }
  }
  this._offspringMap = this._offspringLevels = void 0;
  // make ancestors _offspringMap obsolete, why not just calculate _offspringMap
  // for each ancestor? since this operation should be as quick as possible
  // and multiple override/replaceFollowing/connect operations could be batched,
  // since the calculation of springs of ancestors postponed to the moment
  // when ancestor is evaluated
  targetSlot._getAncestors().forEach(function (ancestor) {
    ancestor._offspringLevels = ancestor._offspringMap = void 0;
  });
  return this;
};


/**
 * replaceFollowing, why not just re-follow, since follow is a quite
 * expensive operation, while replaceFollowing only affect the replaced one
 *
 * !!NOTE this method will not re-evaluate the slot and starts the mutation process
 * at once, so remember to call touch at last if you want to start a mutaion process
 *
 * @param idx the index of following
 * @param following a slot or any object, if not provided, the "idx"th following will
 * not be followed anymore.
 *
 * @return {Slot} this
 */
Slot.prototype.replaceFollowing = function replaceFollowing(idx, following) {
  let args = [idx, 1];
  if (following != void 0) {
    args.push(following);
  }
  let [replaced] = this.followings.splice.apply(this.followings, args);
  // replace the same following, just return
  if (replaced == following) {
    return this;
  }
  if (replaced instanceof Slot) {
    delete replaced._followerMap[this._id];
    replaced._offspringLevels = replaced._offspringMap = void 0;
    replaced._getAncestors().forEach(function (ancestor) {
      ancestor._offspringLevels = ancestor._offspringMap = void 0;
    });
  }
  if (following instanceof Slot) {
    following._offspringLevels = following._offspringMap = void 0;
    // make ancestors _offspringMap obsolete
    following._getAncestors().forEach(function (ancestor) {
      ancestor._offspringLevels = ancestor._offspringMap = void 0;
    });
  }
  return this;
};

/**
 * this is the shortcut of replaceFollowing(idx)
 *
 * !!NOTE this method will not re-evaluate the slot and starts the mutation process
 * at once, so remember to call touch at last if you want to start a mutaion process
 *
 * @param {number} idx - the index of
 * */
Slot.prototype.removeFollowing = function removeFollowing(idx) {
  return this.replaceFollowing(idx);
};

// propogate from me
Slot.prototype._propogate = function ({ roots }) {
  // if has only one follower, touch it
  let followers = _objectValues(this._followerMap);
  if (followers.length == 0) {
    return;
  }
  if (followers.length == 1) {
    followers[0].touch(true, { roots, involved: [this] });
    return;
  }
  if (this._offspringLevels === void 0 || this._offspringMap === void 0) {
    this._setupOffsprings();
  }
  let cleanSlots = {};
  // mutate root is always considered to be dirty,
  // otherwise it won't propogate
  let mutateRoot = this;
  let changeCbArgs = [];
  for (let level of this._offspringLevels) {
    for (let follower of level) {
      let involved = follower._followings.filter(function (following) {
        return following instanceof Slot &&
          (following._id === mutateRoot._id ||
           (mutateRoot._offspringMap[following._id] && !cleanSlots[following._id]));
      });
      // clean follower will be untouched
      let dirty = involved.length > 0;
      if (!dirty) {
        cleanSlots[follower._id] = follower;
        continue;
      }
      follower.debug && console.info(`slot: slot ${follower._tag} will be refreshed`);
      let context = {involved, roots};
      let oldV = follower._value;
      // DON'T CALL change callbacks
      if (follower.touch(false, context, false)) {
        changeCbArgs.push([follower, oldV, involved]);
      } else {
        cleanSlots[follower._id] = follower;
      }
    }
  }
  // call change callbacks at last
  changeCbArgs.forEach(function ([slot, oldV, involved]) {
    for (let cb of slot._changeCbs) {
      cb.apply(slot, [slot._value, oldV, { involved, roots }]);
    }
  });
};

/**
 * get or set the value, if no argument is given, get the current value of Slot,
 * otherwise, set the value of Slot, *the mutation process* starts, and returns *this*
 *
 * @return {(any|Slot)}
 * */
Slot.prototype.val = function val(...args) {
  if (args.length === 0) {
    if (this._value === void 0 && typeof this._valueFunc === 'function') {
      this._value = this._valueFunc.apply(
        this, [
          this._followings.map(it => it instanceof Slot? it.val(): it),
          { roots: [ this ] },
        ]
      );
    }
    return this._value;
  }
  return this.setV(args[0]);
};

/**
 * set the slot's value, and starts a *mutation process*
 *
 * @param {any} newV - the new value of slot,
 * */
Slot.prototype.setV = function setV(newV) {
  if (typeof this._mutationTester === 'function' && !this._mutationTester(this._value, newV)) {
    return this;
  }
  this.debug && console.info(
    `slot: slot ${this._tag} mutated -- `, this._value, '->', newV
  );
  let oldV = this._value;
  this._value = newV;
  this._propogate({ roots: [this] });
  for (let cb of this._changeCbs) {
    cb.apply(this, [this._value, oldV, {
      roots: [this],
    }]);
  }
  return this;
};


const _colletFollowers = function _colletFollowers(slots) {
  let ret = {};
  for (let o of slots) {
    for (let k in o._followerMap) {
      let follower = o._followerMap[k];
      ret[follower._id] = follower;
    }
  }
  return _objectValues(ret);
};

Slot.prototype._setupOffsprings = function () {
  this._offspringMap = {};
  this._offspringLevels = [];
  if (_isEmptyObj(this._followerMap)) {
    return this;
  }
  // level by level
  for (
    let _offspringMap = _objectValues(this._followerMap), level = 1;
    _offspringMap.length;
    _offspringMap = _colletFollowers(_offspringMap), ++level
  )  {
    for (let i of _offspringMap) {
      if (!(i._id in this._offspringMap)) {
        this._offspringMap[i._id] = {
          slot: i,
          level: level
        };
      } else {
        this._offspringMap[i._id].level = Math.max(
          this._offspringMap[i._id].level, level
        );
      }
    }
  }
  let currentLevel = 0;
  let slots;
  for (
    let { slot, level } of
    _objectValues(this._offspringMap).sort((a, b) => a.level - b.level)
  ) {
    if (level > currentLevel) {
      slots = [];
      this._offspringLevels.push(slots);
      currentLevel = level;
    }
    slots.push(slot);
  }
  return this;
};

/**
 * touch a slot, that means, re-evaluate the slot's value forcely, and
 * starts *mutation process* and call change callbacks if neccessary.
 * usually, you don't need call this method, only when you need to mutate the
 * following graph (like override, replaceFollowing, follow)
 *
 * @param propogate - if starts a *mutation process*, default is true
 * @param context - if null, the touched slot is served as roots, default is null
 * @param callChangeCbs - if call change callbacks, default is true
 *
 * @return {boolean} - return true if this Slot is mutated, else false
 *
 * @see Slot#override
 * */
Slot.prototype.touch = function (propogate=true, context=null, callChangeCbs=true) {
  let oldValue = this._value;
  if (!context) {
    context = { roots: [this] };
  }
  if (this._valueFunc) {
    let args = [
      this._followings.map(following => following instanceof Slot? following.val(): following),
      context,
    ];
    this._value = this._valueFunc.apply(this, args);
  }
  if (typeof this._mutationTester == 'function' && !this._mutationTester(oldValue, this._value)) {
    return false;
  }
  if (callChangeCbs) {
    for (let cb of this._changeCbs) {
      cb.apply(this, [this._value, oldValue, context]);
    }
  }
  propogate && this._propogate({ roots: context.roots });
  return true;
};

/**
 * make a follower slot of me. this following has only one followings it is me.
 * @example
 * const $$s1 = Slot(1);
 * const $$s2 = $$s1.fork(n => n + 1);
 *
 * is equivalent to:
 *
 * @example
 * const $$s1 = Slot(1);
 * const $$s2 = Slot(([n]) => n + 1, [$$s1]);
 *
 * @param {function} func - the evaluation function
 * */
Slot.prototype.fork = function (func) {
  return Slot(function ([following]) {
    return func(following);
  }, [this]);
};

/**
 * unfollow all the followings if any and follow the new followings using the new
 * valueFunc, this method will mutate the following graph.
 *
 * !!NOTE this method will not re-evaluate the slot and starts the mutation process
 * at once, so remember to call touch at last if you want to start a mutaion process
 *
 * @param {function} valueFunc
 * @param {array} followings - please see Slot's constructor
 *
 * @return {Slot} this
 *
 * @see {@link Slot}
 * */
Slot.prototype.follow = function (valueFunc, followings) {
  // if connect to the same followings, nothing happens
  let connectTheSameFollowings = true;
  for (let i = 0; i < Math.max(followings.length, this._followings.length); ++i) {
    if (followings[i] != this._followings[i]) {
      connectTheSameFollowings = false;
      break;
    }
  }
  if (connectTheSameFollowings && (valueFunc == this._valueFunc)) {
    return this;
  }
  let self = this;
  // make my value invalid
  self._value = void 0;
  self._valueFunc = valueFunc;
  // affected followings slots
  let affected = {};
  for (let slot of followings) {
    if (slot instanceof Slot) {
      affected[slot._id] = slot;
    }
  }
  for (let following of self._followings) {
    if (following instanceof Slot) {
      if (followings.every(function (s) {
        return s !== following;
      })) {
        affected[following._id] = following;
        delete following._followerMap[self._id];
      }
    }
  }
  // setup followings
  self._followings = [];
  followings.forEach(function (slot) {
    self._followings.push(slot);
    if (slot instanceof Slot) {
      slot._followerMap[self._id] = self;
    }
  });
  // make ancestors' _offspringMap obsolete, it will be
  // recalculated until they are evaluated
  self._getAncestors().forEach(function (ancestor) {
    ancestor._offspringLevels = ancestor._offspringMap = void 0;
  });
  return self;
};

Slot.prototype._getAncestors = function _getAncestors() {
  let ancestors = {};
  for (let following of this._followings) {
    if (following instanceof Slot) {
      if (!ancestors[following._id]) {
        ancestors[following._id] = following;
        for (let ancestor of following._getAncestors()) {
          ancestors[ancestor._id] = ancestor;
        }
      }
    }
  }
  return _objectValues(ancestors);
};


/**
 * shrink to a data slot with value *val*
 * @return {Slot} this
 * */
Slot.prototype.shrink = function (val) {
  this._valueFunc = void 0;
  return this.follow(void 0, []).val(val);
};


/**
 * mutate a group of slots by applying functions upon them, and starts a
 * *mutation proccess* whose roots are these slots to be changed
 *
 * NOTE!!! this is not the same as set value for each slot one by one, but
 * consider them as a whole to find the best mutaion path
 *
 * @example
 * let $$p1 = Slot(1).tag('p1');
 * let $$p2 = Slot(2).tag('p2');
 * let $$p3 = $$p2.fork(it => it + 1).tag('p3');
 * let $$p4 = Slot(function ([p1, p2, p3], { roots, involved }) {
 *   console.log(roots.map(it => it.tag())); // p1, p2
 *   console.log(involved.map(it => it.tag())); // p1, p2, p3
 *   return p1 + p2 + p3;
 * }, [$$p1, $$p2, $$p3]);
 * rimple.mutateWith([
 *   [$$p1, n => n + 1],
 *   [$$p2, n => n + 2],
 * ]);
 * console.log($$p1.val(), $$p2.val(), $$p3.val(), $$p4.val()); // 2, 4, 5, 11
 *
 * @param {array} slotValuePairs - each element is an array, whose first value is
 * a Slot, and second is the function to be applied
 *
 * */
export const mutateWith = function mutateWith(slotFnPairs) {
  return mutate(slotFnPairs.map(function ([slot, fn]) {
    return [slot, fn && fn.apply(slot, [slot.val()])];
  }));
};

/**
 * mutate a group of slots, and starts ONE *mutation proccess* whose
 * roots are these slots to be changed.
 *
 * NOTE!!! this is not the same as set value for each slot one by one, but
 * consider them as a whole to find the best mutaion path
 *
 * @example
 * let $$p1 = Slot(1).tag('p1');
 * let $$p2 = Slot(2).tag('p2');
 * let $$p3 = $$p2.fork(it => it + 1).tag('p3');
 * let $$p4 = Slot(function ([p1, p2, p3], { roots, involved }) {
 *   console.log(roots.map(it => it.tag())); // p1, p2
 *   console.log(involved.map(it => it.tag())); // p1, p2, p3
 *   return p1 + p2 + p3;
 * }, [$$p1, $$p2, $$p3]);
 * rimple.mutate([
 *   [$$p1, 2],
 *   [$$p2, 4],
 * ]);
 * console.log($$p1.val(), $$p2.val(), $$p3.val(), $$p4.val()); // 2, 4, 5, 11
 *
 * @param {array} slotValuePairs - each element is an array, whose first value is
 * a Slot, and second is the new value of slots
 *
 * */
export const mutate = function (slotValuePairs) {
  let cleanSlots = {};
  let roots = slotValuePairs.map(([slot]) => slot);
  // mutate the targets directly
  slotValuePairs.forEach(function ([slot, value]) {
    slot.debug && console.info(`slot ${slot._tag} mutationTester`, slot._value, value);
    let oldValue = slot._value;
    if (value !== void 0) {
      slot._value = value;
      if (slot._mutationTester && !slot._mutationTester(oldValue, value)) {
        cleanSlots[slot._id] = slot;
        return;
      }
    }
    for (let cb of slot._changeCbs) {
      cb.call(slot, slot._value, oldValue, { roots });
    }
  });
  // related slots include roots
  let relatedSlots = {};
  let addToRelatedSlots = function (slot, level) {
    if (slot._id in relatedSlots) {
      relatedSlots[slot._id].level = Math.max(
        level, relatedSlots[slot._id].level
      );
    } else {
      relatedSlots[slot._id] = {
        slot,
        level,
      };
    }
  };
  slotValuePairs.forEach(function ([slot]) {
    addToRelatedSlots(slot, 0);
    if (slot._offspringMap === void 0) {
      slot._setupOffsprings();
    }
    _objectValues(slot._offspringMap).forEach(function ({slot: offspring, level}) {
      addToRelatedSlots(offspring, level);
    });
  });
  // group _offspringMap by level, but omits level 0 (those mutated directly)
  // since they have been touched
  let slots;
  let levels = [];
  let currentLevel = 0;
  _objectValues(relatedSlots)
  .sort((a, b) => a.level - b.level)
  .filter(it => it.level > 0)
  .forEach(function ({slot, level}) {
    if (level > currentLevel) {
      slots = [];
      levels.push(slots);
      currentLevel = level;
    }
    slots.push(slot);
  });
  let changeCbArgs = [];
  for (let level of levels) {
    for (let follower of level) {
      let involved = follower._followings.filter(function (p) {
        return p instanceof Slot && relatedSlots[p._id] && !cleanSlots[p._id];
      });
      if (!involved.length) {
        cleanSlots[follower._id] = follower;
        continue;
      }
      follower.debug && console.info(
        `slot: slot ${follower._tag} will be refreshed`
      );
      let context = { involved, roots };
      // DON'T use val(), val will reevaluate this slot
      let oldV = follower._value;
      // DON'T CALL change callbacks
      if (follower.touch(false, context, false)) {
        changeCbArgs.push([follower, oldV, involved]);
      } else {
        cleanSlots[follower._id] = follower;
      }
    }
  }
  // call change callbacks at last
  changeCbArgs.forEach(function ([slot, oldV, involved]) {
    for (let cb of slot._changeCbs) {
      cb.apply(slot, [slot._value, oldV, { involved, roots }]);
    }
  });
};

/**
 * apply the function to me
 *
 * @example
 * const $$s = Slot(1);
 * $$s.mutateWith(function (s, n) {
 *  return s + n;
 * }, [2]);
 * console.log($$s.val()); // output 3
 *
 * is equivalent to
 * @example
 * const $$s = Slot(1);
 * $$s.val(function (s, n) { return s + n; }($$s.val(), 2));
 *
 * @param {function} func - the mutation function
 * @param {array} args - the extra arguments provided to func, default is []
 *
 * @return {Slot} this
 *
 * */
Slot.prototype.mutateWith = function mutateWith(func, args=[]) {
  args = [this._value].concat(args);
  return this.val(func.apply(this, args));
};

/**
 * add methods to Slot's prototype
 *
 * @example
 * rimple.mixin({
 *   negate() {
 *     return this.val(-this.val());
 *   }
 * });
 * const $$s = Slot(1).negate();
 * console.log($$s.val()); // output -1
 *
 * @param {object} mixins - the mixins to be added
 *
 * */
export const mixin = function mixin(mixins) {
  Object.assign(Slot.prototype, mixins);
};

/**
 * create an immutable slot, which use '===' to test if value is mutated
 * */
export const immSlot = function (value) {
  return Slot(value).mutationTester(function (a, b) {
    return a !== b;
  });
};

mixin(booleanOps);
mixin(objectOps);
mixin(numberOps);
mixin(listOps);

export const slot = Slot;

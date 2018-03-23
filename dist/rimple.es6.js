var booleanOps={toggle:function(){return this.val(!this.val())},on:function(){return this.val(!0)},off:function(){return this.val(!1)}},patch={patch:function(a){return this.debug&&console.info('slot: slot '+this.tag()+' is about to be patched',a),this.val(Object.assign({},this.val(),a))},omit:function(a){var b,c=!0,d=!1;try{for(var e,f,g=a[Symbol.iterator]();!(c=(e=g.next()).done);c=!0)f=e.value,delete this._value[f]}catch(a){d=!0,b=a}finally{try{!c&&g.return&&g.return()}finally{if(d)throw b}}return this.val(Object.assign({},this._value))},set:function(a,b){return'function'==typeof b&&(b=b.apply(this,[this._value[a]])),this._value[a]=b,this.val(Array.isArray(this._value)?[].concat(this._value):Object.assign({},this._value)),this},setIn:function(a,b){for(var c=this._value,d=0;d<a.length-1;++d){var e=a[d],f=a[d+1];c[e]=c[e]||(Number.isInteger(f)?[]:{}),c=c[e]}var g=a[a.length-1];return'function'==typeof b&&(b=b.apply(this,[c[g]])),c[g]=b,this.val(Object.assign({},this._value)),this}};patch.assoc=patch.set,patch.assocIn=patch.setIn;var numberOps={inc:function(){var a=0<arguments.length&&arguments[0]!==void 0?arguments[0]:1;return this.val(this.val()+a)},dec:function(){var a=0<arguments.length&&arguments[0]!==void 0?arguments[0]:1;return this.val(this.val()-a)},mod:function(a){return this.val(this.val()%a)},multiply:function(a){return this.val(this.val()*a)},divide:function(a){return this.val(this.val()/a)}},listOps={concat:function(a){return this.val([].concat(this.val()).concat(a))},map:function(a){return this.val(this.val().map(a))},filter:function(a){var b=this.val();return this.val(b.filter(a))},slice:function(){var a=this.val();return this.val(a.slice.apply(a,Array.from(arguments)))},shift:function(){return this.val().shift(),this.val([].concat(this.val())),this},unshift:function(a){return this.val().unshift(a),this.val([].concat(this.val())),this},push:function(a){return this.val().push(a),this.val([].concat(this.val())),this},pop:function(){return this.val().pop(),this.val([].concat(this.val())),this},reverse:function(){return this.val([].concat(this.val().reverse())),this}},_slicedToArray=function(){function a(a,b){var c,d=[],e=!0,f=!1;try{for(var g,h=a[Symbol.iterator]();!(e=(g=h.next()).done)&&(d.push(g.value),!(b&&d.length===b));e=!0);}catch(a){f=!0,c=a}finally{try{!e&&h['return']&&h['return']()}finally{if(f)throw c}}return d}return function(b,c){if(Array.isArray(b))return b;if(Symbol.iterator in Object(b))return a(b,c);throw new TypeError('Invalid attempt to destructure non-iterable instance')}}(),_uniqueId=function(){var a=1;return function(){var b=0<arguments.length&&arguments[0]!==void 0?arguments[0]:'';return b+a++}}(),_isEmptyObj=function(a){for(var b in a)if(a.hasOwnProperty(b))return!1;return!0},_objectValues=function(a){if(Object.values)return Object.values(a);var b=[];for(var c in a)a.hasOwnProperty(c)&&b.push(a[c]);return b},Slot=function a(){for(var b=arguments.length,c=Array(b),d=0;d<b;d++)c[d]=arguments[d];if(!(this instanceof a))return new(Function.prototype.bind.apply(a,[null].concat(c)));if(this._id=_uniqueId(),this._changeCbs=[],this._followings=[],this._followerMap={},this._offspringMap={},this._offspringLevels=[],this._tag='',Object.defineProperty(this,'token',{get:function(){return this._tag+'-'+this._id}}),Object.defineProperty(this,'followings',{get:function(){return this._followings}}),Object.defineProperty(this,'followers',{get:function(){return _objectValues(this._followerMap)}}),1>=c.length)this._value=c[0];else{var e=c[0],f=c[1],g=c[2];this.follow(e,f,g)}};Slot.prototype.isTopmost=function(){return!this._followings.length},Slot.prototype.tag=function(a){return void 0==a?this._tag:(this._tag=a,this)},Slot.prototype.mutationTester=function(a){return this._mutationTester=a,this},Slot.prototype.change=function(a){return this._changeCbs.push(a),this},Slot.prototype.offChange=function(a){this._changeCbs=this._changeCbs.filter(function(b){return b!=a})},Slot.prototype.override=function(a){var b,c=!0,d=!1;try{for(var e,f,g=a._followings[Symbol.iterator]();!(c=(e=g.next()).done);c=!0)f=e.value,delete f._followerMap[a._id]}catch(a){d=!0,b=a}finally{try{!c&&g.return&&g.return()}finally{if(d)throw b}}for(var h in a._followerMap){var j=a._followerMap[h];this._followerMap[h]=j;for(var k=0;k<j._followings.length;++k)if(j._followings[k]._id==a._id){j._followings[k]=this;break}}return this._offspringMap=this._offspringLevels=void 0,a._getAncestors().forEach(function(a){a._offspringLevels=a._offspringMap=void 0}),this},Slot.prototype.replaceFollowing=function(a,b){var c=[a,1];void 0!=b&&c.push(b);var d=this.followings.splice.apply(this.followings,c),e=_slicedToArray(d,1),f=e[0];return f==b?this:(f instanceof Slot&&(delete f._followerMap[this._id],f._offspringLevels=f._offspringMap=void 0,f._getAncestors().forEach(function(a){a._offspringLevels=a._offspringMap=void 0})),b instanceof Slot&&(b._offspringLevels=b._offspringMap=void 0,b._getAncestors().forEach(function(a){a._offspringLevels=a._offspringMap=void 0})),this)},Slot.prototype.removeFollowing=function(a){return this.replaceFollowing(a)},Slot.prototype._propogate=function(a){var b=a.roots,c=_objectValues(this._followerMap);if(0!=c.length){if(1==c.length)return void c[0].touch(!0,{roots:b,involved:[this]});(void 0===this._offspringLevels||void 0===this._offspringMap)&&this._setupOffsprings();var d,e={},f=this,g=[],h=!0,i=!1;try{for(var j,k=this._offspringLevels[Symbol.iterator]();!(h=(j=k.next()).done);h=!0){var l=j.value,m=!0,n=!1,o=void 0;try{for(var p,q=l[Symbol.iterator]();!(m=(p=q.next()).done);m=!0){var r=p.value,s=r._followings.filter(function(a){return a instanceof Slot&&(a._id===f._id||f._offspringMap[a._id]&&!e[a._id])}),t=0<s.length;if(!t){e[r._id]=r;continue}r.debug&&console.info('slot: slot '+r._tag+' will be refreshed');var u=r._value;r.touch(!1,{involved:s,roots:b},!1)?g.push([r,u,s]):e[r._id]=r}}catch(a){n=!0,o=a}finally{try{!m&&q.return&&q.return()}finally{if(n)throw o}}}}catch(a){i=!0,d=a}finally{try{!h&&k.return&&k.return()}finally{if(i)throw d}}g.forEach(function(a){var c,d=_slicedToArray(a,3),e=d[0],f=d[1],g=d[2],h=!0,i=!1;try{for(var j,k,l=e._changeCbs[Symbol.iterator]();!(h=(j=l.next()).done);h=!0)k=j.value,k.apply(e,[e._value,f,{involved:g,roots:b}])}catch(a){i=!0,c=a}finally{try{!h&&l.return&&l.return()}finally{if(i)throw c}}})}},Slot.prototype.val=function(){return 0===arguments.length?(void 0===this._value&&'function'==typeof this._valueFunc&&(this._value=this._valueFunc.apply(this,[this._followings.map(function(a){return a instanceof Slot?a.val():a}),{roots:[this]}])),this._value):this.setV(0>=arguments.length?void 0:arguments[0])},Slot.prototype.setV=function(a){if('function'==typeof this._mutationTester&&!this._mutationTester(this._value,a))return this;this.debug&&console.info('slot: slot '+this._tag+' mutated -- ',this._value,'->',a);var b=this._value;this._value=a,this._propogate({roots:[this]});var c,d=!0,e=!1;try{for(var f,g,h=this._changeCbs[Symbol.iterator]();!(d=(f=h.next()).done);d=!0)g=f.value,g.apply(this,[this._value,b,{roots:[this]}])}catch(a){e=!0,c=a}finally{try{!d&&h.return&&h.return()}finally{if(e)throw c}}return this};var _colletFollowers=function(a){var b,c={},d=!0,e=!1;try{for(var f,g,h=a[Symbol.iterator]();!(d=(f=h.next()).done);d=!0)for(var i in g=f.value,g._followerMap){var j=g._followerMap[i];c[j._id]=j}}catch(a){e=!0,b=a}finally{try{!d&&h.return&&h.return()}finally{if(e)throw b}}return _objectValues(c)};Slot.prototype._setupOffsprings=function(){if(this._offspringMap={},this._offspringLevels=[],_isEmptyObj(this._followerMap))return this;for(var a=_objectValues(this._followerMap),b=1;a.length;a=_colletFollowers(a),++b){var c=!0,d=!1,e=void 0;try{for(var f,g,h=a[Symbol.iterator]();!(c=(f=h.next()).done);c=!0)g=f.value,g._id in this._offspringMap?this._offspringMap[g._id].level=Math.max(this._offspringMap[g._id].level,b):this._offspringMap[g._id]={slot:g,level:b}}catch(a){d=!0,e=a}finally{try{!c&&h.return&&h.return()}finally{if(d)throw e}}}var j,k,l=0,m=!0,n=!1;try{for(var o,p=_objectValues(this._offspringMap).sort(function(c,a){return c.level-a.level})[Symbol.iterator]();!(m=(o=p.next()).done);m=!0){var q=o.value,r=q.slot,s=q.level;s>l&&(j=[],this._offspringLevels.push(j),l=s),j.push(r)}}catch(a){n=!0,k=a}finally{try{!m&&p.return&&p.return()}finally{if(n)throw k}}return this},Slot.prototype.touch=function(){var a=0<arguments.length&&void 0!==arguments[0]?arguments[0]:!0,b=1<arguments.length&&void 0!==arguments[1]?arguments[1]:null,c=2<arguments.length&&void 0!==arguments[2]?arguments[2]:!0,d=this._value;if(b||(b={roots:[this]}),this._valueFunc){var e=[this._followings.map(function(a){return a instanceof Slot?a.val():a}),b];this._value=this._valueFunc.apply(this,e)}if('function'==typeof this._mutationTester&&!this._mutationTester(d,this._value))return!1;if(c){var f,g=!0,h=!1;try{for(var i,j,k=this._changeCbs[Symbol.iterator]();!(g=(i=k.next()).done);g=!0)j=i.value,j.apply(this,[this._value,d,b])}catch(a){h=!0,f=a}finally{try{!g&&k.return&&k.return()}finally{if(h)throw f}}}return a&&this._propogate({roots:b.roots}),!0},Slot.prototype.fork=function(a){return Slot(function(b){var c=_slicedToArray(b,1),d=c[0];return a(d)},[this])},Slot.prototype.follow=function(a,b){for(var c=!0,d=0;d<Math.max(b.length,this._followings.length);++d)if(b[d]!=this._followings[d]){c=!1;break}if(c&&a==this._valueFunc)return this;var e=this;e._value=void 0,e._valueFunc=a;var f,g=!0,h=!1;try{for(var i,j=b[Symbol.iterator]();!(g=(i=j.next()).done);g=!0);}catch(a){h=!0,f=a}finally{try{!g&&j.return&&j.return()}finally{if(h)throw f}}var k,l=function(a){a instanceof Slot&&b.every(function(b){return b!==a})&&delete a._followerMap[e._id]},m=!0,n=!1;try{for(var o,p,q=e._followings[Symbol.iterator]();!(m=(o=q.next()).done);m=!0)p=o.value,l(p)}catch(a){n=!0,k=a}finally{try{!m&&q.return&&q.return()}finally{if(n)throw k}}return e._followings=[],b.forEach(function(a){e._followings.push(a),a instanceof Slot&&(a._followerMap[e._id]=e)}),e._getAncestors().forEach(function(a){a._offspringLevels=a._offspringMap=void 0}),e},Slot.prototype._getAncestors=function(){var a,b={},c=!0,d=!1;try{for(var e,f,g=this._followings[Symbol.iterator]();!(c=(e=g.next()).done);c=!0)if(f=e.value,f instanceof Slot&&!b[f._id]){b[f._id]=f;var h=!0,i=!1,j=void 0;try{for(var k,l,m=f._getAncestors()[Symbol.iterator]();!(h=(k=m.next()).done);h=!0)l=k.value,b[l._id]=l}catch(a){i=!0,j=a}finally{try{!h&&m.return&&m.return()}finally{if(i)throw j}}}}catch(b){d=!0,a=b}finally{try{!c&&g.return&&g.return()}finally{if(d)throw a}}return _objectValues(b)},Slot.prototype.shrink=function(a){return this._valueFunc=void 0,this.follow(void 0,[]).val(a)};var mutateWith=function(a){return mutate(a.map(function(a){var b=_slicedToArray(a,2),c=b[0],d=b[1];return[c,d&&d.apply(c,[c.val()])]}))},mutate=function(a){var b={},c=a.map(function(a){var b=_slicedToArray(a,1),c=b[0];return c});a.forEach(function(a){var d=_slicedToArray(a,2),e=d[0],f=d[1];e.debug&&console.info('slot '+e._tag+' mutationTester',e._value,f);var g=e._value;if(void 0!==f&&(e._value=f,e._mutationTester&&!e._mutationTester(g,f)))return void(b[e._id]=e);var h,i=!0,j=!1;try{for(var k,l,m=e._changeCbs[Symbol.iterator]();!(i=(k=m.next()).done);i=!0)l=k.value,l.call(e,e._value,g,{roots:c})}catch(a){j=!0,h=a}finally{try{!i&&m.return&&m.return()}finally{if(j)throw h}}});var d={},e=function(a,b){a._id in d?d[a._id].level=Math.max(b,d[a._id].level):d[a._id]={slot:a,level:b}};a.forEach(function(a){var b=_slicedToArray(a,1),c=b[0];e(c,0),void 0===c._offspringMap&&c._setupOffsprings(),_objectValues(c._offspringMap).forEach(function(a){var b=a.slot,c=a.level;e(b,c)})});var f,g=[],h=0;_objectValues(d).sort(function(c,a){return c.level-a.level}).filter(function(a){return 0<a.level}).forEach(function(a){var b=a.slot,c=a.level;c>h&&(f=[],g.push(f),h=c),f.push(b)});var i,j=[],k=!0,l=!1;try{for(var m,n=g[Symbol.iterator]();!(k=(m=n.next()).done);k=!0){var o=m.value,p=!0,q=!1,r=void 0;try{for(var s,t=o[Symbol.iterator]();!(p=(s=t.next()).done);p=!0){var u=s.value,v=u._followings.filter(function(a){return a instanceof Slot&&d[a._id]&&!b[a._id]});if(!v.length){b[u._id]=u;continue}u.debug&&console.info('slot: slot '+u._tag+' will be refreshed');var w=u._value;u.touch(!1,{involved:v,roots:c},!1)?j.push([u,w,v]):b[u._id]=u}}catch(a){q=!0,r=a}finally{try{!p&&t.return&&t.return()}finally{if(q)throw r}}}}catch(a){l=!0,i=a}finally{try{!k&&n.return&&n.return()}finally{if(l)throw i}}j.forEach(function(a){var b,d=_slicedToArray(a,3),e=d[0],f=d[1],g=d[2],h=!0,i=!1;try{for(var j,k,l=e._changeCbs[Symbol.iterator]();!(h=(j=l.next()).done);h=!0)k=j.value,k.apply(e,[e._value,f,{involved:g,roots:c}])}catch(a){i=!0,b=a}finally{try{!h&&l.return&&l.return()}finally{if(i)throw b}}})};Slot.prototype.mutateWith=function(a){var b=1<arguments.length&&void 0!==arguments[1]?arguments[1]:[];return b=[this._value].concat(b),this.val(a.apply(this,b))};var mixin=function(a){Object.assign(Slot.prototype,a)},immSlot=function(a){return Slot(a).mutationTester(function(c,a){return c!==a})};mixin(booleanOps),mixin(patch),mixin(numberOps),mixin(listOps);var slot=Slot;export{Slot,mutateWith,mutate,mixin,immSlot,slot};

//# sourceMappingURL=rimple.es6.js.map
) {
      var cb = _step5.value;

      cb.apply(this, [this._value, oldV, {
        roots: [this]
      }]);
    }
  } catch (err) {
    _didIteratorError5 = true;
    _iteratorError5 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion5 && _iterator5.return) {
        _iterator5.return();
      }
    } finally {
      if (_didIteratorError5) {
        throw _iteratorError5;
      }
    }
  }

  return this;
};

var _colletFollowers = function _colletFollowers(slots) {
  var ret = {};
  var _iteratorNormalCompletion6 = true;
  var _didIteratorError6 = false;
  var _iteratorError6 = undefined;

  try {
    for (var _iterator6 = slots[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
      var o = _step6.value;

      for (var k in o._followerMap) {
        var follower = o._followerMap[k];
        ret[follower._id] = follower;
      }
    }
  } catch (err) {
    _didIteratorError6 = true;
    _iteratorError6 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion6 && _iterator6.return) {
        _iterator6.return();
      }
    } finally {
      if (_didIteratorError6) {
        throw _iteratorError6;
      }
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

  for (var _offspringMap = _objectValues(this._followerMap), level = 1; _offspringMap.length; _offspringMap = _colletFollowers(_offspringMap), ++level) {
    var _iteratorNormalCompletion7 = true;
    var _didIteratorError7 = false;
    var _iteratorError7 = undefined;

    try {
      for (var _iterator7 = _offspringMap[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
        var i = _step7.value;

        if (!(i._id in this._offspringMap)) {
          this._offspringMap[i._id] = {
            slot: i,
            level: level
          };
        } else {
          this._offspringMap[i._id].level = Math.max(this._offspringMap[i._id].level, level);
        }
      }
    } catch (err) {
      _didIteratorError7 = true;
      _iteratorError7 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion7 && _iterator7.return) {
          _iterator7.return();
        }
      } finally {
        if (_didIteratorError7) {
          throw _iteratorError7;
        }
      }
    }
  }
  var currentLevel = 0;
  var slots = void 0;
  var _iteratorNormalCompletion8 = true;
  var _didIteratorError8 = false;
  var _iteratorError8 = undefined;

  try {
    for (var _iterator8 = _objectValues(this._offspringMap).sort(function (a, b) {
      return a.level - b.level;
    })[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
      var _ref4 = _step8.value;
      var _slot = _ref4.slot;
      var _level = _ref4.level;

      if (_level > currentLevel) {
        slots = [];
        this._offspringLevels.push(slots);
        currentLevel = _level;
      }
      slots.push(_slot);
    }
  } catch (err) {
    _didIteratorError8 = true;
    _iteratorError8 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion8 && _iterator8.return) {
        _iterator8.return();
      }
    } finally {
      if (_didIteratorError8) {
        throw _iteratorError8;
      }
    }
  }

  return this;
};

Slot.prototype.touch = function () {
  var propogate = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
  var context = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
  var callChangeCbs = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;

  var oldValue = this._value;
  if (!context) {
    context = { roots: [this] };
  }
  if (this._valueFunc) {
    var _args = [this._followings.map(function (following) {
      return following instanceof Slot ? following.val() : following;
    }), context];
    this._value = this._valueFunc.apply(this, _args);
  }
  if (typeof this._mutationTester == 'function' && !this._mutationTester(oldValue, this._value)) {
    return false;
  }
  if (callChangeCbs) {
    var _iteratorNormalCompletion9 = true;
    var _didIteratorError9 = false;
    var _iteratorError9 = undefined;

    try {
      for (var _iterator9 = this._changeCbs[Symbol.iterator](), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
        var cb = _step9.value;

        cb.apply(this, [this._value, oldValue, context]);
      }
    } catch (err) {
      _didIteratorError9 = true;
      _iteratorError9 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion9 && _iterator9.return) {
          _iterator9.return();
        }
      } finally {
        if (_didIteratorError9) {
          throw _iteratorError9;
        }
      }
    }
  }
  propogate && this._propogate({ roots: context.roots });
  return true;
};

Slot.prototype.fork = function (func) {
  return Slot(function (_ref5) {
    var _ref6 = _slicedToArray(_ref5, 1),
        following = _ref6[0];

    return func(following);
  }, [this]);
};

Slot.prototype.follow = function (valueFunc, followings) {
  var connectTheSameFollowings = true;
  for (var i = 0; i < Math.max(followings.length, this._followings.length); ++i) {
    if (followings[i] != this._followings[i]) {
      connectTheSameFollowings = false;
      break;
    }
  }
  if (connectTheSameFollowings && valueFunc == this._valueFunc) {
    return this;
  }
  var self = this;

  self._value = void 0;
  self._valueFunc = valueFunc;

  var _iteratorNormalCompletion10 = true;
  var _didIteratorError10 = false;
  var _iteratorError10 = undefined;

  try {
    for (var _iterator10 = followings[Symbol.iterator](), _step10; !(_iteratorNormalCompletion10 = (_step10 = _iterator10.next()).done); _iteratorNormalCompletion10 = true) {
      
    }
  } catch (err) {
    _didIteratorError10 = true;
    _iteratorError10 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion10 && _iterator10.return) {
        _iterator10.return();
      }
    } finally {
      if (_didIteratorError10) {
        throw _iteratorError10;
      }
    }
  }

  var _loop = function _loop(following) {
    if (following instanceof Slot) {
      if (followings.every(function (s) {
        return s !== following;
      })) {
        delete following._followerMap[self._id];
      }
    }
  };

  var _iteratorNormalCompletion11 = true;
  var _didIteratorError11 = false;
  var _iteratorError11 = undefined;

  try {
    for (var _iterator11 = self._followings[Symbol.iterator](), _step11; !(_iteratorNormalCompletion11 = (_step11 = _iterator11.next()).done); _iteratorNormalCompletion11 = true) {
      var following = _step11.value;

      _loop(following);
    }
  } catch (err) {
    _didIteratorError11 = true;
    _iteratorError11 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion11 && _iterator11.return) {
        _iterator11.return();
      }
    } finally {
      if (_didIteratorError11) {
        throw _iteratorError11;
      }
    }
  }

  self._followings = [];
  followings.forEach(function (slot) {
    self._followings.push(slot);
    if (slot instanceof Slot) {
      slot._followerMap[self._id] = self;
    }
  });

  self._getAncestors().forEach(function (ancestor) {
    ancestor._offspringLevels = ancestor._offspringMap = void 0;
  });
  return self;
};

Slot.prototype._getAncestors = function _getAncestors() {
  var ancestors = {};
  var _iteratorNormalCompletion12 = true;
  var _didIteratorError12 = false;
  var _iteratorError12 = undefined;

  try {
    for (var _iterator12 = this._followings[Symbol.iterator](), _step12; !(_iteratorNormalCompletion12 = (_step12 = _iterator12.next()).done); _iteratorNormalCompletion12 = true) {
      var following = _step12.value;

      if (following instanceof Slot) {
        if (!ancestors[following._id]) {
          ancestors[following._id] = following;
          var _iteratorNormalCompletion13 = true;
          var _didIteratorError13 = false;
          var _iteratorError13 = undefined;

          try {
            for (var _iterator13 = following._getAncestors()[Symbol.iterator](), _step13; !(_iteratorNormalCompletion13 = (_step13 = _iterator13.next()).done); _iteratorNormalCompletion13 = true) {
              var ancestor = _step13.value;

              ancestors[ancestor._id] = ancestor;
            }
          } catch (err) {
            _didIteratorError13 = true;
            _iteratorError13 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion13 && _iterator13.return) {
                _iterator13.return();
              }
            } finally {
              if (_didIteratorError13) {
                throw _iteratorError13;
              }
            }
          }
        }
      }
    }
  } catch (err) {
    _didIteratorError12 = true;
    _iteratorError12 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion12 && _iterator12.return) {
        _iterator12.return();
      }
    } finally {
      if (_didIteratorError12) {
        throw _iteratorError12;
      }
    }
  }

  return _objectValues(ancestors);
};

Slot.prototype.shrink = function (val) {
  this._valueFunc = void 0;
  return this.follow(void 0, []).val(val);
};

var mutateWith = function mutateWith(slotFnPairs) {
  return mutate(slotFnPairs.map(function (_ref7) {
    var _ref8 = _slicedToArray(_ref7, 2),
        slot = _ref8[0],
        fn = _ref8[1];

    return [slot, fn && fn.apply(slot, [slot.val()])];
  }));
};

var mutate = function mutate(slotValuePairs) {
  var cleanSlots = {};
  var roots = slotValuePairs.map(function (_ref9) {
    var _ref10 = _slicedToArray(_ref9, 1),
        slot = _ref10[0];

    return slot;
  });

  slotValuePairs.forEach(function (_ref11) {
    var _ref12 = _slicedToArray(_ref11, 2),
        slot = _ref12[0],
        value = _ref12[1];

    slot.debug && console.info('slot ' + slot._tag + ' mutationTester', slot._value, value);
    var oldValue = slot._value;
    if (value !== void 0) {
      slot._value = value;
      if (slot._mutationTester && !slot._mutationTester(oldValue, value)) {
        cleanSlots[slot._id] = slot;
        return;
      }
    }
    var _iteratorNormalCompletion14 = true;
    var _didIteratorError14 = false;
    var _iteratorError14 = undefined;

    try {
      for (var _iterator14 = slot._changeCbs[Symbol.iterator](), _step14; !(_iteratorNormalCompletion14 = (_step14 = _iterator14.next()).done); _iteratorNormalCompletion14 = true) {
        var cb = _step14.value;

        cb.call(slot, slot._value, oldValue, { roots: roots });
      }
    } catch (err) {
      _didIteratorError14 = true;
      _iteratorError14 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion14 && _iterator14.return) {
          _iterator14.return();
        }
      } finally {
        if (_didIteratorError14) {
          throw _iteratorError14;
        }
      }
    }
  });

  var relatedSlots = {};
  var addToRelatedSlots = function addToRelatedSlots(slot, level) {
    if (slot._id in relatedSlots) {
      relatedSlots[slot._id].level = Math.max(level, relatedSlots[slot._id].level);
    } else {
      relatedSlots[slot._id] = {
        slot: slot,
        level: level
      };
    }
  };
  slotValuePairs.forEach(function (_ref13) {
    var _ref14 = _slicedToArray(_ref13, 1),
        slot = _ref14[0];

    addToRelatedSlots(slot, 0);
    if (slot._offspringMap === void 0) {
      slot._setupOffsprings();
    }
    _objectValues(slot._offspringMap).forEach(function (_ref15) {
      var offspring = _ref15.slot,
          level = _ref15.level;

      addToRelatedSlots(offspring, level);
    });
  });

  var slots = void 0;
  var levels = [];
  var currentLevel = 0;
  _objectValues(relatedSlots).sort(function (a, b) {
    return a.level - b.level;
  }).filter(function (it) {
    return it.level > 0;
  }).forEach(function (_ref16) {
    var slot = _ref16.slot,
        level = _ref16.level;

    if (level > currentLevel) {
      slots = [];
      levels.push(slots);
      currentLevel = level;
    }
    slots.push(slot);
  });
  var changeCbArgs = [];
  var _iteratorNormalCompletion15 = true;
  var _didIteratorError15 = false;
  var _iteratorError15 = undefined;

  try {
    for (var _iterator15 = levels[Symbol.iterator](), _step15; !(_iteratorNormalCompletion15 = (_step15 = _iterator15.next()).done); _iteratorNormalCompletion15 = true) {
      var level = _step15.value;
      var _iteratorNormalCompletion17 = true;
      var _didIteratorError17 = false;
      var _iteratorError17 = undefined;

      try {
        for (var _iterator17 = level[Symbol.iterator](), _step17; !(_iteratorNormalCompletion17 = (_step17 = _iterator17.next()).done); _iteratorNormalCompletion17 = true) {
          var follower = _step17.value;

          var involved = follower._followings.filter(function (p) {
            return p instanceof Slot && relatedSlots[p._id] && !cleanSlots[p._id];
          });
          if (!involved.length) {
            cleanSlots[follower._id] = follower;
            continue;
          }
          follower.debug && console.info('slot: slot ' + follower._tag + ' will be refreshed');
          var context = { involved: involved, roots: roots };

          var oldV = follower._value;

          if (follower.touch(false, context, false)) {
            changeCbArgs.push([follower, oldV, involved]);
          } else {
            cleanSlots[follower._id] = follower;
          }
        }
      } catch (err) {
        _didIteratorError17 = true;
        _iteratorError17 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion17 && _iterator17.return) {
            _iterator17.return();
          }
        } finally {
          if (_didIteratorError17) {
            throw _iteratorError17;
          }
        }
      }
    }
  } catch (err) {
    _didIteratorError15 = true;
    _iteratorError15 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion15 && _iterator15.return) {
        _iterator15.return();
      }
    } finally {
      if (_didIteratorError15) {
        throw _iteratorError15;
      }
    }
  }

  changeCbArgs.forEach(function (_ref17) {
    var _ref18 = _slicedToArray(_ref17, 3),
        slot = _ref18[0],
        oldV = _ref18[1],
        involved = _ref18[2];

    var _iteratorNormalCompletion16 = true;
    var _didIteratorError16 = false;
    var _iteratorError16 = undefined;

    try {
      for (var _iterator16 = slot._changeCbs[Symbol.iterator](), _step16; !(_iteratorNormalCompletion16 = (_step16 = _iterator16.next()).done); _iteratorNormalCompletion16 = true) {
        var cb = _step16.value;

        cb.apply(slot, [slot._value, oldV, { involved: involved, roots: roots }]);
      }
    } catch (err) {
      _didIteratorError16 = true;
      _iteratorError16 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion16 && _iterator16.return) {
          _iterator16.return();
        }
      } finally {
        if (_didIteratorError16) {
          throw _iteratorError16;
        }
      }
    }
  });
};

Slot.prototype.mutateWith = function mutateWith(func) {
  var args = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];

  args = [this._value].concat(args);
  return this.val(func.apply(this, args));
};

var mixin = function mixin(mixins) {
  Object.assign(Slot.prototype, mixins);
};

var immSlot = function immSlot(value) {
  return Slot(value).mutationTester(function (a, b) {
    return a !== b;
  });
};

mixin(booleanOps);
mixin(patch);
mixin(numberOps);
mixin(listOps);

var slot = Slot;

export { Slot, mutateWith, mutate, mixin, immSlot, slot };

//# sourceMappingURL=rimple.es6.js.map
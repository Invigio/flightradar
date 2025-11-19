var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all3) => {
  for (var name in all3)
    __defProp(target, name, { get: all3[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/react/cjs/react.development.js
var require_react_development = __commonJS({
  "node_modules/react/cjs/react.development.js"(exports, module) {
    "use strict";
    if (true) {
      (function() {
        "use strict";
        if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ !== "undefined" && typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart === "function") {
          __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart(new Error());
        }
        var ReactVersion = "18.3.1";
        var REACT_ELEMENT_TYPE = Symbol.for("react.element");
        var REACT_PORTAL_TYPE = Symbol.for("react.portal");
        var REACT_FRAGMENT_TYPE = Symbol.for("react.fragment");
        var REACT_STRICT_MODE_TYPE = Symbol.for("react.strict_mode");
        var REACT_PROFILER_TYPE = Symbol.for("react.profiler");
        var REACT_PROVIDER_TYPE = Symbol.for("react.provider");
        var REACT_CONTEXT_TYPE = Symbol.for("react.context");
        var REACT_FORWARD_REF_TYPE = Symbol.for("react.forward_ref");
        var REACT_SUSPENSE_TYPE = Symbol.for("react.suspense");
        var REACT_SUSPENSE_LIST_TYPE = Symbol.for("react.suspense_list");
        var REACT_MEMO_TYPE = Symbol.for("react.memo");
        var REACT_LAZY_TYPE = Symbol.for("react.lazy");
        var REACT_OFFSCREEN_TYPE = Symbol.for("react.offscreen");
        var MAYBE_ITERATOR_SYMBOL = Symbol.iterator;
        var FAUX_ITERATOR_SYMBOL = "@@iterator";
        function getIteratorFn(maybeIterable) {
          if (maybeIterable === null || typeof maybeIterable !== "object") {
            return null;
          }
          var maybeIterator = MAYBE_ITERATOR_SYMBOL && maybeIterable[MAYBE_ITERATOR_SYMBOL] || maybeIterable[FAUX_ITERATOR_SYMBOL];
          if (typeof maybeIterator === "function") {
            return maybeIterator;
          }
          return null;
        }
        var ReactCurrentDispatcher = {
          /**
           * @internal
           * @type {ReactComponent}
           */
          current: null
        };
        var ReactCurrentBatchConfig = {
          transition: null
        };
        var ReactCurrentActQueue = {
          current: null,
          // Used to reproduce behavior of `batchedUpdates` in legacy mode.
          isBatchingLegacy: false,
          didScheduleLegacyUpdate: false
        };
        var ReactCurrentOwner = {
          /**
           * @internal
           * @type {ReactComponent}
           */
          current: null
        };
        var ReactDebugCurrentFrame = {};
        var currentExtraStackFrame = null;
        function setExtraStackFrame(stack) {
          {
            currentExtraStackFrame = stack;
          }
        }
        {
          ReactDebugCurrentFrame.setExtraStackFrame = function(stack) {
            {
              currentExtraStackFrame = stack;
            }
          };
          ReactDebugCurrentFrame.getCurrentStack = null;
          ReactDebugCurrentFrame.getStackAddendum = function() {
            var stack = "";
            if (currentExtraStackFrame) {
              stack += currentExtraStackFrame;
            }
            var impl = ReactDebugCurrentFrame.getCurrentStack;
            if (impl) {
              stack += impl() || "";
            }
            return stack;
          };
        }
        var enableScopeAPI = false;
        var enableCacheElement = false;
        var enableTransitionTracing = false;
        var enableLegacyHidden = false;
        var enableDebugTracing = false;
        var ReactSharedInternals = {
          ReactCurrentDispatcher,
          ReactCurrentBatchConfig,
          ReactCurrentOwner
        };
        {
          ReactSharedInternals.ReactDebugCurrentFrame = ReactDebugCurrentFrame;
          ReactSharedInternals.ReactCurrentActQueue = ReactCurrentActQueue;
        }
        function warn(format) {
          {
            {
              for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
                args[_key - 1] = arguments[_key];
              }
              printWarning("warn", format, args);
            }
          }
        }
        function error(format) {
          {
            {
              for (var _len2 = arguments.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
                args[_key2 - 1] = arguments[_key2];
              }
              printWarning("error", format, args);
            }
          }
        }
        function printWarning(level, format, args) {
          {
            var ReactDebugCurrentFrame2 = ReactSharedInternals.ReactDebugCurrentFrame;
            var stack = ReactDebugCurrentFrame2.getStackAddendum();
            if (stack !== "") {
              format += "%s";
              args = args.concat([stack]);
            }
            var argsWithFormat = args.map(function(item) {
              return String(item);
            });
            argsWithFormat.unshift("Warning: " + format);
            Function.prototype.apply.call(console[level], console, argsWithFormat);
          }
        }
        var didWarnStateUpdateForUnmountedComponent = {};
        function warnNoop(publicInstance, callerName) {
          {
            var _constructor = publicInstance.constructor;
            var componentName = _constructor && (_constructor.displayName || _constructor.name) || "ReactClass";
            var warningKey = componentName + "." + callerName;
            if (didWarnStateUpdateForUnmountedComponent[warningKey]) {
              return;
            }
            error("Can't call %s on a component that is not yet mounted. This is a no-op, but it might indicate a bug in your application. Instead, assign to `this.state` directly or define a `state = {};` class property with the desired state in the %s component.", callerName, componentName);
            didWarnStateUpdateForUnmountedComponent[warningKey] = true;
          }
        }
        var ReactNoopUpdateQueue = {
          /**
           * Checks whether or not this composite component is mounted.
           * @param {ReactClass} publicInstance The instance we want to test.
           * @return {boolean} True if mounted, false otherwise.
           * @protected
           * @final
           */
          isMounted: function(publicInstance) {
            return false;
          },
          /**
           * Forces an update. This should only be invoked when it is known with
           * certainty that we are **not** in a DOM transaction.
           *
           * You may want to call this when you know that some deeper aspect of the
           * component's state has changed but `setState` was not called.
           *
           * This will not invoke `shouldComponentUpdate`, but it will invoke
           * `componentWillUpdate` and `componentDidUpdate`.
           *
           * @param {ReactClass} publicInstance The instance that should rerender.
           * @param {?function} callback Called after component is updated.
           * @param {?string} callerName name of the calling function in the public API.
           * @internal
           */
          enqueueForceUpdate: function(publicInstance, callback, callerName) {
            warnNoop(publicInstance, "forceUpdate");
          },
          /**
           * Replaces all of the state. Always use this or `setState` to mutate state.
           * You should treat `this.state` as immutable.
           *
           * There is no guarantee that `this.state` will be immediately updated, so
           * accessing `this.state` after calling this method may return the old value.
           *
           * @param {ReactClass} publicInstance The instance that should rerender.
           * @param {object} completeState Next state.
           * @param {?function} callback Called after component is updated.
           * @param {?string} callerName name of the calling function in the public API.
           * @internal
           */
          enqueueReplaceState: function(publicInstance, completeState, callback, callerName) {
            warnNoop(publicInstance, "replaceState");
          },
          /**
           * Sets a subset of the state. This only exists because _pendingState is
           * internal. This provides a merging strategy that is not available to deep
           * properties which is confusing. TODO: Expose pendingState or don't use it
           * during the merge.
           *
           * @param {ReactClass} publicInstance The instance that should rerender.
           * @param {object} partialState Next partial state to be merged with state.
           * @param {?function} callback Called after component is updated.
           * @param {?string} Name of the calling function in the public API.
           * @internal
           */
          enqueueSetState: function(publicInstance, partialState, callback, callerName) {
            warnNoop(publicInstance, "setState");
          }
        };
        var assign = Object.assign;
        var emptyObject = {};
        {
          Object.freeze(emptyObject);
        }
        function Component(props, context, updater) {
          this.props = props;
          this.context = context;
          this.refs = emptyObject;
          this.updater = updater || ReactNoopUpdateQueue;
        }
        Component.prototype.isReactComponent = {};
        Component.prototype.setState = function(partialState, callback) {
          if (typeof partialState !== "object" && typeof partialState !== "function" && partialState != null) {
            throw new Error("setState(...): takes an object of state variables to update or a function which returns an object of state variables.");
          }
          this.updater.enqueueSetState(this, partialState, callback, "setState");
        };
        Component.prototype.forceUpdate = function(callback) {
          this.updater.enqueueForceUpdate(this, callback, "forceUpdate");
        };
        {
          var deprecatedAPIs = {
            isMounted: ["isMounted", "Instead, make sure to clean up subscriptions and pending requests in componentWillUnmount to prevent memory leaks."],
            replaceState: ["replaceState", "Refactor your code to use setState instead (see https://github.com/facebook/react/issues/3236)."]
          };
          var defineDeprecationWarning = function(methodName, info) {
            Object.defineProperty(Component.prototype, methodName, {
              get: function() {
                warn("%s(...) is deprecated in plain JavaScript React classes. %s", info[0], info[1]);
                return void 0;
              }
            });
          };
          for (var fnName in deprecatedAPIs) {
            if (deprecatedAPIs.hasOwnProperty(fnName)) {
              defineDeprecationWarning(fnName, deprecatedAPIs[fnName]);
            }
          }
        }
        function ComponentDummy() {
        }
        ComponentDummy.prototype = Component.prototype;
        function PureComponent(props, context, updater) {
          this.props = props;
          this.context = context;
          this.refs = emptyObject;
          this.updater = updater || ReactNoopUpdateQueue;
        }
        var pureComponentPrototype = PureComponent.prototype = new ComponentDummy();
        pureComponentPrototype.constructor = PureComponent;
        assign(pureComponentPrototype, Component.prototype);
        pureComponentPrototype.isPureReactComponent = true;
        function createRef() {
          var refObject = {
            current: null
          };
          {
            Object.seal(refObject);
          }
          return refObject;
        }
        var isArrayImpl = Array.isArray;
        function isArray2(a2) {
          return isArrayImpl(a2);
        }
        function typeName(value) {
          {
            var hasToStringTag = typeof Symbol === "function" && Symbol.toStringTag;
            var type = hasToStringTag && value[Symbol.toStringTag] || value.constructor.name || "Object";
            return type;
          }
        }
        function willCoercionThrow(value) {
          {
            try {
              testStringCoercion(value);
              return false;
            } catch (e2) {
              return true;
            }
          }
        }
        function testStringCoercion(value) {
          return "" + value;
        }
        function checkKeyStringCoercion(value) {
          {
            if (willCoercionThrow(value)) {
              error("The provided key is an unsupported type %s. This value must be coerced to a string before before using it here.", typeName(value));
              return testStringCoercion(value);
            }
          }
        }
        function getWrappedName(outerType, innerType, wrapperName) {
          var displayName = outerType.displayName;
          if (displayName) {
            return displayName;
          }
          var functionName = innerType.displayName || innerType.name || "";
          return functionName !== "" ? wrapperName + "(" + functionName + ")" : wrapperName;
        }
        function getContextName(type) {
          return type.displayName || "Context";
        }
        function getComponentNameFromType(type) {
          if (type == null) {
            return null;
          }
          {
            if (typeof type.tag === "number") {
              error("Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue.");
            }
          }
          if (typeof type === "function") {
            return type.displayName || type.name || null;
          }
          if (typeof type === "string") {
            return type;
          }
          switch (type) {
            case REACT_FRAGMENT_TYPE:
              return "Fragment";
            case REACT_PORTAL_TYPE:
              return "Portal";
            case REACT_PROFILER_TYPE:
              return "Profiler";
            case REACT_STRICT_MODE_TYPE:
              return "StrictMode";
            case REACT_SUSPENSE_TYPE:
              return "Suspense";
            case REACT_SUSPENSE_LIST_TYPE:
              return "SuspenseList";
          }
          if (typeof type === "object") {
            switch (type.$$typeof) {
              case REACT_CONTEXT_TYPE:
                var context = type;
                return getContextName(context) + ".Consumer";
              case REACT_PROVIDER_TYPE:
                var provider = type;
                return getContextName(provider._context) + ".Provider";
              case REACT_FORWARD_REF_TYPE:
                return getWrappedName(type, type.render, "ForwardRef");
              case REACT_MEMO_TYPE:
                var outerName = type.displayName || null;
                if (outerName !== null) {
                  return outerName;
                }
                return getComponentNameFromType(type.type) || "Memo";
              case REACT_LAZY_TYPE: {
                var lazyComponent = type;
                var payload = lazyComponent._payload;
                var init = lazyComponent._init;
                try {
                  return getComponentNameFromType(init(payload));
                } catch (x2) {
                  return null;
                }
              }
            }
          }
          return null;
        }
        var hasOwnProperty2 = Object.prototype.hasOwnProperty;
        var RESERVED_PROPS = {
          key: true,
          ref: true,
          __self: true,
          __source: true
        };
        var specialPropKeyWarningShown, specialPropRefWarningShown, didWarnAboutStringRefs;
        {
          didWarnAboutStringRefs = {};
        }
        function hasValidRef(config) {
          {
            if (hasOwnProperty2.call(config, "ref")) {
              var getter = Object.getOwnPropertyDescriptor(config, "ref").get;
              if (getter && getter.isReactWarning) {
                return false;
              }
            }
          }
          return config.ref !== void 0;
        }
        function hasValidKey(config) {
          {
            if (hasOwnProperty2.call(config, "key")) {
              var getter = Object.getOwnPropertyDescriptor(config, "key").get;
              if (getter && getter.isReactWarning) {
                return false;
              }
            }
          }
          return config.key !== void 0;
        }
        function defineKeyPropWarningGetter(props, displayName) {
          var warnAboutAccessingKey = function() {
            {
              if (!specialPropKeyWarningShown) {
                specialPropKeyWarningShown = true;
                error("%s: `key` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://reactjs.org/link/special-props)", displayName);
              }
            }
          };
          warnAboutAccessingKey.isReactWarning = true;
          Object.defineProperty(props, "key", {
            get: warnAboutAccessingKey,
            configurable: true
          });
        }
        function defineRefPropWarningGetter(props, displayName) {
          var warnAboutAccessingRef = function() {
            {
              if (!specialPropRefWarningShown) {
                specialPropRefWarningShown = true;
                error("%s: `ref` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://reactjs.org/link/special-props)", displayName);
              }
            }
          };
          warnAboutAccessingRef.isReactWarning = true;
          Object.defineProperty(props, "ref", {
            get: warnAboutAccessingRef,
            configurable: true
          });
        }
        function warnIfStringRefCannotBeAutoConverted(config) {
          {
            if (typeof config.ref === "string" && ReactCurrentOwner.current && config.__self && ReactCurrentOwner.current.stateNode !== config.__self) {
              var componentName = getComponentNameFromType(ReactCurrentOwner.current.type);
              if (!didWarnAboutStringRefs[componentName]) {
                error('Component "%s" contains the string ref "%s". Support for string refs will be removed in a future major release. This case cannot be automatically converted to an arrow function. We ask you to manually fix this case by using useRef() or createRef() instead. Learn more about using refs safely here: https://reactjs.org/link/strict-mode-string-ref', componentName, config.ref);
                didWarnAboutStringRefs[componentName] = true;
              }
            }
          }
        }
        var ReactElement = function(type, key, ref, self2, source, owner, props) {
          var element = {
            // This tag allows us to uniquely identify this as a React Element
            $$typeof: REACT_ELEMENT_TYPE,
            // Built-in properties that belong on the element
            type,
            key,
            ref,
            props,
            // Record the component responsible for creating this element.
            _owner: owner
          };
          {
            element._store = {};
            Object.defineProperty(element._store, "validated", {
              configurable: false,
              enumerable: false,
              writable: true,
              value: false
            });
            Object.defineProperty(element, "_self", {
              configurable: false,
              enumerable: false,
              writable: false,
              value: self2
            });
            Object.defineProperty(element, "_source", {
              configurable: false,
              enumerable: false,
              writable: false,
              value: source
            });
            if (Object.freeze) {
              Object.freeze(element.props);
              Object.freeze(element);
            }
          }
          return element;
        };
        function createElement5(type, config, children) {
          var propName;
          var props = {};
          var key = null;
          var ref = null;
          var self2 = null;
          var source = null;
          if (config != null) {
            if (hasValidRef(config)) {
              ref = config.ref;
              {
                warnIfStringRefCannotBeAutoConverted(config);
              }
            }
            if (hasValidKey(config)) {
              {
                checkKeyStringCoercion(config.key);
              }
              key = "" + config.key;
            }
            self2 = config.__self === void 0 ? null : config.__self;
            source = config.__source === void 0 ? null : config.__source;
            for (propName in config) {
              if (hasOwnProperty2.call(config, propName) && !RESERVED_PROPS.hasOwnProperty(propName)) {
                props[propName] = config[propName];
              }
            }
          }
          var childrenLength = arguments.length - 2;
          if (childrenLength === 1) {
            props.children = children;
          } else if (childrenLength > 1) {
            var childArray = Array(childrenLength);
            for (var i2 = 0; i2 < childrenLength; i2++) {
              childArray[i2] = arguments[i2 + 2];
            }
            {
              if (Object.freeze) {
                Object.freeze(childArray);
              }
            }
            props.children = childArray;
          }
          if (type && type.defaultProps) {
            var defaultProps = type.defaultProps;
            for (propName in defaultProps) {
              if (props[propName] === void 0) {
                props[propName] = defaultProps[propName];
              }
            }
          }
          {
            if (key || ref) {
              var displayName = typeof type === "function" ? type.displayName || type.name || "Unknown" : type;
              if (key) {
                defineKeyPropWarningGetter(props, displayName);
              }
              if (ref) {
                defineRefPropWarningGetter(props, displayName);
              }
            }
          }
          return ReactElement(type, key, ref, self2, source, ReactCurrentOwner.current, props);
        }
        function cloneAndReplaceKey(oldElement, newKey) {
          var newElement = ReactElement(oldElement.type, newKey, oldElement.ref, oldElement._self, oldElement._source, oldElement._owner, oldElement.props);
          return newElement;
        }
        function cloneElement(element, config, children) {
          if (element === null || element === void 0) {
            throw new Error("React.cloneElement(...): The argument must be a React element, but you passed " + element + ".");
          }
          var propName;
          var props = assign({}, element.props);
          var key = element.key;
          var ref = element.ref;
          var self2 = element._self;
          var source = element._source;
          var owner = element._owner;
          if (config != null) {
            if (hasValidRef(config)) {
              ref = config.ref;
              owner = ReactCurrentOwner.current;
            }
            if (hasValidKey(config)) {
              {
                checkKeyStringCoercion(config.key);
              }
              key = "" + config.key;
            }
            var defaultProps;
            if (element.type && element.type.defaultProps) {
              defaultProps = element.type.defaultProps;
            }
            for (propName in config) {
              if (hasOwnProperty2.call(config, propName) && !RESERVED_PROPS.hasOwnProperty(propName)) {
                if (config[propName] === void 0 && defaultProps !== void 0) {
                  props[propName] = defaultProps[propName];
                } else {
                  props[propName] = config[propName];
                }
              }
            }
          }
          var childrenLength = arguments.length - 2;
          if (childrenLength === 1) {
            props.children = children;
          } else if (childrenLength > 1) {
            var childArray = Array(childrenLength);
            for (var i2 = 0; i2 < childrenLength; i2++) {
              childArray[i2] = arguments[i2 + 2];
            }
            props.children = childArray;
          }
          return ReactElement(element.type, key, ref, self2, source, owner, props);
        }
        function isValidElement(object) {
          return typeof object === "object" && object !== null && object.$$typeof === REACT_ELEMENT_TYPE;
        }
        var SEPARATOR = ".";
        var SUBSEPARATOR = ":";
        function escape(key) {
          var escapeRegex = /[=:]/g;
          var escaperLookup = {
            "=": "=0",
            ":": "=2"
          };
          var escapedString = key.replace(escapeRegex, function(match) {
            return escaperLookup[match];
          });
          return "$" + escapedString;
        }
        var didWarnAboutMaps = false;
        var userProvidedKeyEscapeRegex = /\/+/g;
        function escapeUserProvidedKey(text) {
          return text.replace(userProvidedKeyEscapeRegex, "$&/");
        }
        function getElementKey(element, index) {
          if (typeof element === "object" && element !== null && element.key != null) {
            {
              checkKeyStringCoercion(element.key);
            }
            return escape("" + element.key);
          }
          return index.toString(36);
        }
        function mapIntoArray(children, array, escapedPrefix, nameSoFar, callback) {
          var type = typeof children;
          if (type === "undefined" || type === "boolean") {
            children = null;
          }
          var invokeCallback = false;
          if (children === null) {
            invokeCallback = true;
          } else {
            switch (type) {
              case "string":
              case "number":
                invokeCallback = true;
                break;
              case "object":
                switch (children.$$typeof) {
                  case REACT_ELEMENT_TYPE:
                  case REACT_PORTAL_TYPE:
                    invokeCallback = true;
                }
            }
          }
          if (invokeCallback) {
            var _child = children;
            var mappedChild = callback(_child);
            var childKey = nameSoFar === "" ? SEPARATOR + getElementKey(_child, 0) : nameSoFar;
            if (isArray2(mappedChild)) {
              var escapedChildKey = "";
              if (childKey != null) {
                escapedChildKey = escapeUserProvidedKey(childKey) + "/";
              }
              mapIntoArray(mappedChild, array, escapedChildKey, "", function(c2) {
                return c2;
              });
            } else if (mappedChild != null) {
              if (isValidElement(mappedChild)) {
                {
                  if (mappedChild.key && (!_child || _child.key !== mappedChild.key)) {
                    checkKeyStringCoercion(mappedChild.key);
                  }
                }
                mappedChild = cloneAndReplaceKey(
                  mappedChild,
                  // Keep both the (mapped) and old keys if they differ, just as
                  // traverseAllChildren used to do for objects as children
                  escapedPrefix + // $FlowFixMe Flow incorrectly thinks React.Portal doesn't have a key
                  (mappedChild.key && (!_child || _child.key !== mappedChild.key) ? (
                    // $FlowFixMe Flow incorrectly thinks existing element's key can be a number
                    // eslint-disable-next-line react-internal/safe-string-coercion
                    escapeUserProvidedKey("" + mappedChild.key) + "/"
                  ) : "") + childKey
                );
              }
              array.push(mappedChild);
            }
            return 1;
          }
          var child;
          var nextName;
          var subtreeCount = 0;
          var nextNamePrefix = nameSoFar === "" ? SEPARATOR : nameSoFar + SUBSEPARATOR;
          if (isArray2(children)) {
            for (var i2 = 0; i2 < children.length; i2++) {
              child = children[i2];
              nextName = nextNamePrefix + getElementKey(child, i2);
              subtreeCount += mapIntoArray(child, array, escapedPrefix, nextName, callback);
            }
          } else {
            var iteratorFn = getIteratorFn(children);
            if (typeof iteratorFn === "function") {
              var iterableChildren = children;
              {
                if (iteratorFn === iterableChildren.entries) {
                  if (!didWarnAboutMaps) {
                    warn("Using Maps as children is not supported. Use an array of keyed ReactElements instead.");
                  }
                  didWarnAboutMaps = true;
                }
              }
              var iterator2 = iteratorFn.call(iterableChildren);
              var step;
              var ii = 0;
              while (!(step = iterator2.next()).done) {
                child = step.value;
                nextName = nextNamePrefix + getElementKey(child, ii++);
                subtreeCount += mapIntoArray(child, array, escapedPrefix, nextName, callback);
              }
            } else if (type === "object") {
              var childrenString = String(children);
              throw new Error("Objects are not valid as a React child (found: " + (childrenString === "[object Object]" ? "object with keys {" + Object.keys(children).join(", ") + "}" : childrenString) + "). If you meant to render a collection of children, use an array instead.");
            }
          }
          return subtreeCount;
        }
        function mapChildren(children, func, context) {
          if (children == null) {
            return children;
          }
          var result = [];
          var count = 0;
          mapIntoArray(children, result, "", "", function(child) {
            return func.call(context, child, count++);
          });
          return result;
        }
        function countChildren(children) {
          var n3 = 0;
          mapChildren(children, function() {
            n3++;
          });
          return n3;
        }
        function forEachChildren(children, forEachFunc, forEachContext) {
          mapChildren(children, function() {
            forEachFunc.apply(this, arguments);
          }, forEachContext);
        }
        function toArray2(children) {
          return mapChildren(children, function(child) {
            return child;
          }) || [];
        }
        function onlyChild(children) {
          if (!isValidElement(children)) {
            throw new Error("React.Children.only expected to receive a single React element child.");
          }
          return children;
        }
        function createContext(defaultValue) {
          var context = {
            $$typeof: REACT_CONTEXT_TYPE,
            // As a workaround to support multiple concurrent renderers, we categorize
            // some renderers as primary and others as secondary. We only expect
            // there to be two concurrent renderers at most: React Native (primary) and
            // Fabric (secondary); React DOM (primary) and React ART (secondary).
            // Secondary renderers store their context values on separate fields.
            _currentValue: defaultValue,
            _currentValue2: defaultValue,
            // Used to track how many concurrent renderers this context currently
            // supports within in a single renderer. Such as parallel server rendering.
            _threadCount: 0,
            // These are circular
            Provider: null,
            Consumer: null,
            // Add these to use same hidden class in VM as ServerContext
            _defaultValue: null,
            _globalName: null
          };
          context.Provider = {
            $$typeof: REACT_PROVIDER_TYPE,
            _context: context
          };
          var hasWarnedAboutUsingNestedContextConsumers = false;
          var hasWarnedAboutUsingConsumerProvider = false;
          var hasWarnedAboutDisplayNameOnConsumer = false;
          {
            var Consumer = {
              $$typeof: REACT_CONTEXT_TYPE,
              _context: context
            };
            Object.defineProperties(Consumer, {
              Provider: {
                get: function() {
                  if (!hasWarnedAboutUsingConsumerProvider) {
                    hasWarnedAboutUsingConsumerProvider = true;
                    error("Rendering <Context.Consumer.Provider> is not supported and will be removed in a future major release. Did you mean to render <Context.Provider> instead?");
                  }
                  return context.Provider;
                },
                set: function(_Provider) {
                  context.Provider = _Provider;
                }
              },
              _currentValue: {
                get: function() {
                  return context._currentValue;
                },
                set: function(_currentValue) {
                  context._currentValue = _currentValue;
                }
              },
              _currentValue2: {
                get: function() {
                  return context._currentValue2;
                },
                set: function(_currentValue2) {
                  context._currentValue2 = _currentValue2;
                }
              },
              _threadCount: {
                get: function() {
                  return context._threadCount;
                },
                set: function(_threadCount) {
                  context._threadCount = _threadCount;
                }
              },
              Consumer: {
                get: function() {
                  if (!hasWarnedAboutUsingNestedContextConsumers) {
                    hasWarnedAboutUsingNestedContextConsumers = true;
                    error("Rendering <Context.Consumer.Consumer> is not supported and will be removed in a future major release. Did you mean to render <Context.Consumer> instead?");
                  }
                  return context.Consumer;
                }
              },
              displayName: {
                get: function() {
                  return context.displayName;
                },
                set: function(displayName) {
                  if (!hasWarnedAboutDisplayNameOnConsumer) {
                    warn("Setting `displayName` on Context.Consumer has no effect. You should set it directly on the context with Context.displayName = '%s'.", displayName);
                    hasWarnedAboutDisplayNameOnConsumer = true;
                  }
                }
              }
            });
            context.Consumer = Consumer;
          }
          {
            context._currentRenderer = null;
            context._currentRenderer2 = null;
          }
          return context;
        }
        var Uninitialized = -1;
        var Pending = 0;
        var Resolved = 1;
        var Rejected = 2;
        function lazyInitializer(payload) {
          if (payload._status === Uninitialized) {
            var ctor = payload._result;
            var thenable = ctor();
            thenable.then(function(moduleObject2) {
              if (payload._status === Pending || payload._status === Uninitialized) {
                var resolved = payload;
                resolved._status = Resolved;
                resolved._result = moduleObject2;
              }
            }, function(error2) {
              if (payload._status === Pending || payload._status === Uninitialized) {
                var rejected = payload;
                rejected._status = Rejected;
                rejected._result = error2;
              }
            });
            if (payload._status === Uninitialized) {
              var pending = payload;
              pending._status = Pending;
              pending._result = thenable;
            }
          }
          if (payload._status === Resolved) {
            var moduleObject = payload._result;
            {
              if (moduleObject === void 0) {
                error("lazy: Expected the result of a dynamic import() call. Instead received: %s\n\nYour code should look like: \n  const MyComponent = lazy(() => import('./MyComponent'))\n\nDid you accidentally put curly braces around the import?", moduleObject);
              }
            }
            {
              if (!("default" in moduleObject)) {
                error("lazy: Expected the result of a dynamic import() call. Instead received: %s\n\nYour code should look like: \n  const MyComponent = lazy(() => import('./MyComponent'))", moduleObject);
              }
            }
            return moduleObject.default;
          } else {
            throw payload._result;
          }
        }
        function lazy(ctor) {
          var payload = {
            // We use these fields to store the result.
            _status: Uninitialized,
            _result: ctor
          };
          var lazyType = {
            $$typeof: REACT_LAZY_TYPE,
            _payload: payload,
            _init: lazyInitializer
          };
          {
            var defaultProps;
            var propTypes;
            Object.defineProperties(lazyType, {
              defaultProps: {
                configurable: true,
                get: function() {
                  return defaultProps;
                },
                set: function(newDefaultProps) {
                  error("React.lazy(...): It is not supported to assign `defaultProps` to a lazy component import. Either specify them where the component is defined, or create a wrapping component around it.");
                  defaultProps = newDefaultProps;
                  Object.defineProperty(lazyType, "defaultProps", {
                    enumerable: true
                  });
                }
              },
              propTypes: {
                configurable: true,
                get: function() {
                  return propTypes;
                },
                set: function(newPropTypes) {
                  error("React.lazy(...): It is not supported to assign `propTypes` to a lazy component import. Either specify them where the component is defined, or create a wrapping component around it.");
                  propTypes = newPropTypes;
                  Object.defineProperty(lazyType, "propTypes", {
                    enumerable: true
                  });
                }
              }
            });
          }
          return lazyType;
        }
        function forwardRef2(render) {
          {
            if (render != null && render.$$typeof === REACT_MEMO_TYPE) {
              error("forwardRef requires a render function but received a `memo` component. Instead of forwardRef(memo(...)), use memo(forwardRef(...)).");
            } else if (typeof render !== "function") {
              error("forwardRef requires a render function but was given %s.", render === null ? "null" : typeof render);
            } else {
              if (render.length !== 0 && render.length !== 2) {
                error("forwardRef render functions accept exactly two parameters: props and ref. %s", render.length === 1 ? "Did you forget to use the ref parameter?" : "Any additional parameter will be undefined.");
              }
            }
            if (render != null) {
              if (render.defaultProps != null || render.propTypes != null) {
                error("forwardRef render functions do not support propTypes or defaultProps. Did you accidentally pass a React component?");
              }
            }
          }
          var elementType = {
            $$typeof: REACT_FORWARD_REF_TYPE,
            render
          };
          {
            var ownName;
            Object.defineProperty(elementType, "displayName", {
              enumerable: false,
              configurable: true,
              get: function() {
                return ownName;
              },
              set: function(name) {
                ownName = name;
                if (!render.name && !render.displayName) {
                  render.displayName = name;
                }
              }
            });
          }
          return elementType;
        }
        var REACT_MODULE_REFERENCE;
        {
          REACT_MODULE_REFERENCE = Symbol.for("react.module.reference");
        }
        function isValidElementType(type) {
          if (typeof type === "string" || typeof type === "function") {
            return true;
          }
          if (type === REACT_FRAGMENT_TYPE || type === REACT_PROFILER_TYPE || enableDebugTracing || type === REACT_STRICT_MODE_TYPE || type === REACT_SUSPENSE_TYPE || type === REACT_SUSPENSE_LIST_TYPE || enableLegacyHidden || type === REACT_OFFSCREEN_TYPE || enableScopeAPI || enableCacheElement || enableTransitionTracing) {
            return true;
          }
          if (typeof type === "object" && type !== null) {
            if (type.$$typeof === REACT_LAZY_TYPE || type.$$typeof === REACT_MEMO_TYPE || type.$$typeof === REACT_PROVIDER_TYPE || type.$$typeof === REACT_CONTEXT_TYPE || type.$$typeof === REACT_FORWARD_REF_TYPE || // This needs to include all possible module reference object
            // types supported by any Flight configuration anywhere since
            // we don't know which Flight build this will end up being used
            // with.
            type.$$typeof === REACT_MODULE_REFERENCE || type.getModuleId !== void 0) {
              return true;
            }
          }
          return false;
        }
        function memo2(type, compare) {
          {
            if (!isValidElementType(type)) {
              error("memo: The first argument must be a component. Instead received: %s", type === null ? "null" : typeof type);
            }
          }
          var elementType = {
            $$typeof: REACT_MEMO_TYPE,
            type,
            compare: compare === void 0 ? null : compare
          };
          {
            var ownName;
            Object.defineProperty(elementType, "displayName", {
              enumerable: false,
              configurable: true,
              get: function() {
                return ownName;
              },
              set: function(name) {
                ownName = name;
                if (!type.name && !type.displayName) {
                  type.displayName = name;
                }
              }
            });
          }
          return elementType;
        }
        function resolveDispatcher() {
          var dispatcher = ReactCurrentDispatcher.current;
          {
            if (dispatcher === null) {
              error("Invalid hook call. Hooks can only be called inside of the body of a function component. This could happen for one of the following reasons:\n1. You might have mismatching versions of React and the renderer (such as React DOM)\n2. You might be breaking the Rules of Hooks\n3. You might have more than one copy of React in the same app\nSee https://reactjs.org/link/invalid-hook-call for tips about how to debug and fix this problem.");
            }
          }
          return dispatcher;
        }
        function useContext(Context) {
          var dispatcher = resolveDispatcher();
          {
            if (Context._context !== void 0) {
              var realContext = Context._context;
              if (realContext.Consumer === Context) {
                error("Calling useContext(Context.Consumer) is not supported, may cause bugs, and will be removed in a future major release. Did you mean to call useContext(Context) instead?");
              } else if (realContext.Provider === Context) {
                error("Calling useContext(Context.Provider) is not supported. Did you mean to call useContext(Context) instead?");
              }
            }
          }
          return dispatcher.useContext(Context);
        }
        function useState2(initialState) {
          var dispatcher = resolveDispatcher();
          return dispatcher.useState(initialState);
        }
        function useReducer(reducer, initialArg, init) {
          var dispatcher = resolveDispatcher();
          return dispatcher.useReducer(reducer, initialArg, init);
        }
        function useRef(initialValue) {
          var dispatcher = resolveDispatcher();
          return dispatcher.useRef(initialValue);
        }
        function useEffect2(create2, deps) {
          var dispatcher = resolveDispatcher();
          return dispatcher.useEffect(create2, deps);
        }
        function useInsertionEffect(create2, deps) {
          var dispatcher = resolveDispatcher();
          return dispatcher.useInsertionEffect(create2, deps);
        }
        function useLayoutEffect(create2, deps) {
          var dispatcher = resolveDispatcher();
          return dispatcher.useLayoutEffect(create2, deps);
        }
        function useCallback2(callback, deps) {
          var dispatcher = resolveDispatcher();
          return dispatcher.useCallback(callback, deps);
        }
        function useMemo(create2, deps) {
          var dispatcher = resolveDispatcher();
          return dispatcher.useMemo(create2, deps);
        }
        function useImperativeHandle(ref, create2, deps) {
          var dispatcher = resolveDispatcher();
          return dispatcher.useImperativeHandle(ref, create2, deps);
        }
        function useDebugValue2(value, formatterFn) {
          {
            var dispatcher = resolveDispatcher();
            return dispatcher.useDebugValue(value, formatterFn);
          }
        }
        function useTransition() {
          var dispatcher = resolveDispatcher();
          return dispatcher.useTransition();
        }
        function useDeferredValue(value) {
          var dispatcher = resolveDispatcher();
          return dispatcher.useDeferredValue(value);
        }
        function useId() {
          var dispatcher = resolveDispatcher();
          return dispatcher.useId();
        }
        function useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot) {
          var dispatcher = resolveDispatcher();
          return dispatcher.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
        }
        var disabledDepth = 0;
        var prevLog;
        var prevInfo;
        var prevWarn;
        var prevError;
        var prevGroup;
        var prevGroupCollapsed;
        var prevGroupEnd;
        function disabledLog() {
        }
        disabledLog.__reactDisabledLog = true;
        function disableLogs() {
          {
            if (disabledDepth === 0) {
              prevLog = console.log;
              prevInfo = console.info;
              prevWarn = console.warn;
              prevError = console.error;
              prevGroup = console.group;
              prevGroupCollapsed = console.groupCollapsed;
              prevGroupEnd = console.groupEnd;
              var props = {
                configurable: true,
                enumerable: true,
                value: disabledLog,
                writable: true
              };
              Object.defineProperties(console, {
                info: props,
                log: props,
                warn: props,
                error: props,
                group: props,
                groupCollapsed: props,
                groupEnd: props
              });
            }
            disabledDepth++;
          }
        }
        function reenableLogs() {
          {
            disabledDepth--;
            if (disabledDepth === 0) {
              var props = {
                configurable: true,
                enumerable: true,
                writable: true
              };
              Object.defineProperties(console, {
                log: assign({}, props, {
                  value: prevLog
                }),
                info: assign({}, props, {
                  value: prevInfo
                }),
                warn: assign({}, props, {
                  value: prevWarn
                }),
                error: assign({}, props, {
                  value: prevError
                }),
                group: assign({}, props, {
                  value: prevGroup
                }),
                groupCollapsed: assign({}, props, {
                  value: prevGroupCollapsed
                }),
                groupEnd: assign({}, props, {
                  value: prevGroupEnd
                })
              });
            }
            if (disabledDepth < 0) {
              error("disabledDepth fell below zero. This is a bug in React. Please file an issue.");
            }
          }
        }
        var ReactCurrentDispatcher$1 = ReactSharedInternals.ReactCurrentDispatcher;
        var prefix;
        function describeBuiltInComponentFrame(name, source, ownerFn) {
          {
            if (prefix === void 0) {
              try {
                throw Error();
              } catch (x2) {
                var match = x2.stack.trim().match(/\n( *(at )?)/);
                prefix = match && match[1] || "";
              }
            }
            return "\n" + prefix + name;
          }
        }
        var reentry = false;
        var componentFrameCache;
        {
          var PossiblyWeakMap = typeof WeakMap === "function" ? WeakMap : Map;
          componentFrameCache = new PossiblyWeakMap();
        }
        function describeNativeComponentFrame(fn, construct) {
          if (!fn || reentry) {
            return "";
          }
          {
            var frame = componentFrameCache.get(fn);
            if (frame !== void 0) {
              return frame;
            }
          }
          var control;
          reentry = true;
          var previousPrepareStackTrace = Error.prepareStackTrace;
          Error.prepareStackTrace = void 0;
          var previousDispatcher;
          {
            previousDispatcher = ReactCurrentDispatcher$1.current;
            ReactCurrentDispatcher$1.current = null;
            disableLogs();
          }
          try {
            if (construct) {
              var Fake = function() {
                throw Error();
              };
              Object.defineProperty(Fake.prototype, "props", {
                set: function() {
                  throw Error();
                }
              });
              if (typeof Reflect === "object" && Reflect.construct) {
                try {
                  Reflect.construct(Fake, []);
                } catch (x2) {
                  control = x2;
                }
                Reflect.construct(fn, [], Fake);
              } else {
                try {
                  Fake.call();
                } catch (x2) {
                  control = x2;
                }
                fn.call(Fake.prototype);
              }
            } else {
              try {
                throw Error();
              } catch (x2) {
                control = x2;
              }
              fn();
            }
          } catch (sample) {
            if (sample && control && typeof sample.stack === "string") {
              var sampleLines = sample.stack.split("\n");
              var controlLines = control.stack.split("\n");
              var s2 = sampleLines.length - 1;
              var c2 = controlLines.length - 1;
              while (s2 >= 1 && c2 >= 0 && sampleLines[s2] !== controlLines[c2]) {
                c2--;
              }
              for (; s2 >= 1 && c2 >= 0; s2--, c2--) {
                if (sampleLines[s2] !== controlLines[c2]) {
                  if (s2 !== 1 || c2 !== 1) {
                    do {
                      s2--;
                      c2--;
                      if (c2 < 0 || sampleLines[s2] !== controlLines[c2]) {
                        var _frame = "\n" + sampleLines[s2].replace(" at new ", " at ");
                        if (fn.displayName && _frame.includes("<anonymous>")) {
                          _frame = _frame.replace("<anonymous>", fn.displayName);
                        }
                        {
                          if (typeof fn === "function") {
                            componentFrameCache.set(fn, _frame);
                          }
                        }
                        return _frame;
                      }
                    } while (s2 >= 1 && c2 >= 0);
                  }
                  break;
                }
              }
            }
          } finally {
            reentry = false;
            {
              ReactCurrentDispatcher$1.current = previousDispatcher;
              reenableLogs();
            }
            Error.prepareStackTrace = previousPrepareStackTrace;
          }
          var name = fn ? fn.displayName || fn.name : "";
          var syntheticFrame = name ? describeBuiltInComponentFrame(name) : "";
          {
            if (typeof fn === "function") {
              componentFrameCache.set(fn, syntheticFrame);
            }
          }
          return syntheticFrame;
        }
        function describeFunctionComponentFrame(fn, source, ownerFn) {
          {
            return describeNativeComponentFrame(fn, false);
          }
        }
        function shouldConstruct(Component2) {
          var prototype3 = Component2.prototype;
          return !!(prototype3 && prototype3.isReactComponent);
        }
        function describeUnknownElementTypeFrameInDEV(type, source, ownerFn) {
          if (type == null) {
            return "";
          }
          if (typeof type === "function") {
            {
              return describeNativeComponentFrame(type, shouldConstruct(type));
            }
          }
          if (typeof type === "string") {
            return describeBuiltInComponentFrame(type);
          }
          switch (type) {
            case REACT_SUSPENSE_TYPE:
              return describeBuiltInComponentFrame("Suspense");
            case REACT_SUSPENSE_LIST_TYPE:
              return describeBuiltInComponentFrame("SuspenseList");
          }
          if (typeof type === "object") {
            switch (type.$$typeof) {
              case REACT_FORWARD_REF_TYPE:
                return describeFunctionComponentFrame(type.render);
              case REACT_MEMO_TYPE:
                return describeUnknownElementTypeFrameInDEV(type.type, source, ownerFn);
              case REACT_LAZY_TYPE: {
                var lazyComponent = type;
                var payload = lazyComponent._payload;
                var init = lazyComponent._init;
                try {
                  return describeUnknownElementTypeFrameInDEV(init(payload), source, ownerFn);
                } catch (x2) {
                }
              }
            }
          }
          return "";
        }
        var loggedTypeFailures = {};
        var ReactDebugCurrentFrame$1 = ReactSharedInternals.ReactDebugCurrentFrame;
        function setCurrentlyValidatingElement(element) {
          {
            if (element) {
              var owner = element._owner;
              var stack = describeUnknownElementTypeFrameInDEV(element.type, element._source, owner ? owner.type : null);
              ReactDebugCurrentFrame$1.setExtraStackFrame(stack);
            } else {
              ReactDebugCurrentFrame$1.setExtraStackFrame(null);
            }
          }
        }
        function checkPropTypes(typeSpecs, values, location, componentName, element) {
          {
            var has = Function.call.bind(hasOwnProperty2);
            for (var typeSpecName in typeSpecs) {
              if (has(typeSpecs, typeSpecName)) {
                var error$1 = void 0;
                try {
                  if (typeof typeSpecs[typeSpecName] !== "function") {
                    var err = Error((componentName || "React class") + ": " + location + " type `" + typeSpecName + "` is invalid; it must be a function, usually from the `prop-types` package, but received `" + typeof typeSpecs[typeSpecName] + "`.This often happens because of typos such as `PropTypes.function` instead of `PropTypes.func`.");
                    err.name = "Invariant Violation";
                    throw err;
                  }
                  error$1 = typeSpecs[typeSpecName](values, typeSpecName, componentName, location, null, "SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED");
                } catch (ex) {
                  error$1 = ex;
                }
                if (error$1 && !(error$1 instanceof Error)) {
                  setCurrentlyValidatingElement(element);
                  error("%s: type specification of %s `%s` is invalid; the type checker function must return `null` or an `Error` but returned a %s. You may have forgotten to pass an argument to the type checker creator (arrayOf, instanceOf, objectOf, oneOf, oneOfType, and shape all require an argument).", componentName || "React class", location, typeSpecName, typeof error$1);
                  setCurrentlyValidatingElement(null);
                }
                if (error$1 instanceof Error && !(error$1.message in loggedTypeFailures)) {
                  loggedTypeFailures[error$1.message] = true;
                  setCurrentlyValidatingElement(element);
                  error("Failed %s type: %s", location, error$1.message);
                  setCurrentlyValidatingElement(null);
                }
              }
            }
          }
        }
        function setCurrentlyValidatingElement$1(element) {
          {
            if (element) {
              var owner = element._owner;
              var stack = describeUnknownElementTypeFrameInDEV(element.type, element._source, owner ? owner.type : null);
              setExtraStackFrame(stack);
            } else {
              setExtraStackFrame(null);
            }
          }
        }
        var propTypesMisspellWarningShown;
        {
          propTypesMisspellWarningShown = false;
        }
        function getDeclarationErrorAddendum() {
          if (ReactCurrentOwner.current) {
            var name = getComponentNameFromType(ReactCurrentOwner.current.type);
            if (name) {
              return "\n\nCheck the render method of `" + name + "`.";
            }
          }
          return "";
        }
        function getSourceInfoErrorAddendum(source) {
          if (source !== void 0) {
            var fileName = source.fileName.replace(/^.*[\\\/]/, "");
            var lineNumber = source.lineNumber;
            return "\n\nCheck your code at " + fileName + ":" + lineNumber + ".";
          }
          return "";
        }
        function getSourceInfoErrorAddendumForProps(elementProps) {
          if (elementProps !== null && elementProps !== void 0) {
            return getSourceInfoErrorAddendum(elementProps.__source);
          }
          return "";
        }
        var ownerHasKeyUseWarning = {};
        function getCurrentComponentErrorInfo(parentType) {
          var info = getDeclarationErrorAddendum();
          if (!info) {
            var parentName = typeof parentType === "string" ? parentType : parentType.displayName || parentType.name;
            if (parentName) {
              info = "\n\nCheck the top-level render call using <" + parentName + ">.";
            }
          }
          return info;
        }
        function validateExplicitKey(element, parentType) {
          if (!element._store || element._store.validated || element.key != null) {
            return;
          }
          element._store.validated = true;
          var currentComponentErrorInfo = getCurrentComponentErrorInfo(parentType);
          if (ownerHasKeyUseWarning[currentComponentErrorInfo]) {
            return;
          }
          ownerHasKeyUseWarning[currentComponentErrorInfo] = true;
          var childOwner = "";
          if (element && element._owner && element._owner !== ReactCurrentOwner.current) {
            childOwner = " It was passed a child from " + getComponentNameFromType(element._owner.type) + ".";
          }
          {
            setCurrentlyValidatingElement$1(element);
            error('Each child in a list should have a unique "key" prop.%s%s See https://reactjs.org/link/warning-keys for more information.', currentComponentErrorInfo, childOwner);
            setCurrentlyValidatingElement$1(null);
          }
        }
        function validateChildKeys(node, parentType) {
          if (typeof node !== "object") {
            return;
          }
          if (isArray2(node)) {
            for (var i2 = 0; i2 < node.length; i2++) {
              var child = node[i2];
              if (isValidElement(child)) {
                validateExplicitKey(child, parentType);
              }
            }
          } else if (isValidElement(node)) {
            if (node._store) {
              node._store.validated = true;
            }
          } else if (node) {
            var iteratorFn = getIteratorFn(node);
            if (typeof iteratorFn === "function") {
              if (iteratorFn !== node.entries) {
                var iterator2 = iteratorFn.call(node);
                var step;
                while (!(step = iterator2.next()).done) {
                  if (isValidElement(step.value)) {
                    validateExplicitKey(step.value, parentType);
                  }
                }
              }
            }
          }
        }
        function validatePropTypes(element) {
          {
            var type = element.type;
            if (type === null || type === void 0 || typeof type === "string") {
              return;
            }
            var propTypes;
            if (typeof type === "function") {
              propTypes = type.propTypes;
            } else if (typeof type === "object" && (type.$$typeof === REACT_FORWARD_REF_TYPE || // Note: Memo only checks outer props here.
            // Inner props are checked in the reconciler.
            type.$$typeof === REACT_MEMO_TYPE)) {
              propTypes = type.propTypes;
            } else {
              return;
            }
            if (propTypes) {
              var name = getComponentNameFromType(type);
              checkPropTypes(propTypes, element.props, "prop", name, element);
            } else if (type.PropTypes !== void 0 && !propTypesMisspellWarningShown) {
              propTypesMisspellWarningShown = true;
              var _name = getComponentNameFromType(type);
              error("Component %s declared `PropTypes` instead of `propTypes`. Did you misspell the property assignment?", _name || "Unknown");
            }
            if (typeof type.getDefaultProps === "function" && !type.getDefaultProps.isReactClassApproved) {
              error("getDefaultProps is only used on classic React.createClass definitions. Use a static property named `defaultProps` instead.");
            }
          }
        }
        function validateFragmentProps(fragment) {
          {
            var keys = Object.keys(fragment.props);
            for (var i2 = 0; i2 < keys.length; i2++) {
              var key = keys[i2];
              if (key !== "children" && key !== "key") {
                setCurrentlyValidatingElement$1(fragment);
                error("Invalid prop `%s` supplied to `React.Fragment`. React.Fragment can only have `key` and `children` props.", key);
                setCurrentlyValidatingElement$1(null);
                break;
              }
            }
            if (fragment.ref !== null) {
              setCurrentlyValidatingElement$1(fragment);
              error("Invalid attribute `ref` supplied to `React.Fragment`.");
              setCurrentlyValidatingElement$1(null);
            }
          }
        }
        function createElementWithValidation(type, props, children) {
          var validType = isValidElementType(type);
          if (!validType) {
            var info = "";
            if (type === void 0 || typeof type === "object" && type !== null && Object.keys(type).length === 0) {
              info += " You likely forgot to export your component from the file it's defined in, or you might have mixed up default and named imports.";
            }
            var sourceInfo = getSourceInfoErrorAddendumForProps(props);
            if (sourceInfo) {
              info += sourceInfo;
            } else {
              info += getDeclarationErrorAddendum();
            }
            var typeString;
            if (type === null) {
              typeString = "null";
            } else if (isArray2(type)) {
              typeString = "array";
            } else if (type !== void 0 && type.$$typeof === REACT_ELEMENT_TYPE) {
              typeString = "<" + (getComponentNameFromType(type.type) || "Unknown") + " />";
              info = " Did you accidentally export a JSX literal instead of a component?";
            } else {
              typeString = typeof type;
            }
            {
              error("React.createElement: type is invalid -- expected a string (for built-in components) or a class/function (for composite components) but got: %s.%s", typeString, info);
            }
          }
          var element = createElement5.apply(this, arguments);
          if (element == null) {
            return element;
          }
          if (validType) {
            for (var i2 = 2; i2 < arguments.length; i2++) {
              validateChildKeys(arguments[i2], type);
            }
          }
          if (type === REACT_FRAGMENT_TYPE) {
            validateFragmentProps(element);
          } else {
            validatePropTypes(element);
          }
          return element;
        }
        var didWarnAboutDeprecatedCreateFactory = false;
        function createFactoryWithValidation(type) {
          var validatedFactory = createElementWithValidation.bind(null, type);
          validatedFactory.type = type;
          {
            if (!didWarnAboutDeprecatedCreateFactory) {
              didWarnAboutDeprecatedCreateFactory = true;
              warn("React.createFactory() is deprecated and will be removed in a future major release. Consider using JSX or use React.createElement() directly instead.");
            }
            Object.defineProperty(validatedFactory, "type", {
              enumerable: false,
              get: function() {
                warn("Factory.type is deprecated. Access the class directly before passing it to createFactory.");
                Object.defineProperty(this, "type", {
                  value: type
                });
                return type;
              }
            });
          }
          return validatedFactory;
        }
        function cloneElementWithValidation(element, props, children) {
          var newElement = cloneElement.apply(this, arguments);
          for (var i2 = 2; i2 < arguments.length; i2++) {
            validateChildKeys(arguments[i2], newElement.type);
          }
          validatePropTypes(newElement);
          return newElement;
        }
        function startTransition(scope, options) {
          var prevTransition = ReactCurrentBatchConfig.transition;
          ReactCurrentBatchConfig.transition = {};
          var currentTransition = ReactCurrentBatchConfig.transition;
          {
            ReactCurrentBatchConfig.transition._updatedFibers = /* @__PURE__ */ new Set();
          }
          try {
            scope();
          } finally {
            ReactCurrentBatchConfig.transition = prevTransition;
            {
              if (prevTransition === null && currentTransition._updatedFibers) {
                var updatedFibersCount = currentTransition._updatedFibers.size;
                if (updatedFibersCount > 10) {
                  warn("Detected a large number of updates inside startTransition. If this is due to a subscription please re-write it to use React provided hooks. Otherwise concurrent mode guarantees are off the table.");
                }
                currentTransition._updatedFibers.clear();
              }
            }
          }
        }
        var didWarnAboutMessageChannel = false;
        var enqueueTaskImpl = null;
        function enqueueTask(task) {
          if (enqueueTaskImpl === null) {
            try {
              var requireString = ("require" + Math.random()).slice(0, 7);
              var nodeRequire = module && module[requireString];
              enqueueTaskImpl = nodeRequire.call(module, "timers").setImmediate;
            } catch (_err) {
              enqueueTaskImpl = function(callback) {
                {
                  if (didWarnAboutMessageChannel === false) {
                    didWarnAboutMessageChannel = true;
                    if (typeof MessageChannel === "undefined") {
                      error("This browser does not have a MessageChannel implementation, so enqueuing tasks via await act(async () => ...) will fail. Please file an issue at https://github.com/facebook/react/issues if you encounter this warning.");
                    }
                  }
                }
                var channel = new MessageChannel();
                channel.port1.onmessage = callback;
                channel.port2.postMessage(void 0);
              };
            }
          }
          return enqueueTaskImpl(task);
        }
        var actScopeDepth = 0;
        var didWarnNoAwaitAct = false;
        function act(callback) {
          {
            var prevActScopeDepth = actScopeDepth;
            actScopeDepth++;
            if (ReactCurrentActQueue.current === null) {
              ReactCurrentActQueue.current = [];
            }
            var prevIsBatchingLegacy = ReactCurrentActQueue.isBatchingLegacy;
            var result;
            try {
              ReactCurrentActQueue.isBatchingLegacy = true;
              result = callback();
              if (!prevIsBatchingLegacy && ReactCurrentActQueue.didScheduleLegacyUpdate) {
                var queue = ReactCurrentActQueue.current;
                if (queue !== null) {
                  ReactCurrentActQueue.didScheduleLegacyUpdate = false;
                  flushActQueue(queue);
                }
              }
            } catch (error2) {
              popActScope(prevActScopeDepth);
              throw error2;
            } finally {
              ReactCurrentActQueue.isBatchingLegacy = prevIsBatchingLegacy;
            }
            if (result !== null && typeof result === "object" && typeof result.then === "function") {
              var thenableResult = result;
              var wasAwaited = false;
              var thenable = {
                then: function(resolve, reject) {
                  wasAwaited = true;
                  thenableResult.then(function(returnValue2) {
                    popActScope(prevActScopeDepth);
                    if (actScopeDepth === 0) {
                      recursivelyFlushAsyncActWork(returnValue2, resolve, reject);
                    } else {
                      resolve(returnValue2);
                    }
                  }, function(error2) {
                    popActScope(prevActScopeDepth);
                    reject(error2);
                  });
                }
              };
              {
                if (!didWarnNoAwaitAct && typeof Promise !== "undefined") {
                  Promise.resolve().then(function() {
                  }).then(function() {
                    if (!wasAwaited) {
                      didWarnNoAwaitAct = true;
                      error("You called act(async () => ...) without await. This could lead to unexpected testing behaviour, interleaving multiple act calls and mixing their scopes. You should - await act(async () => ...);");
                    }
                  });
                }
              }
              return thenable;
            } else {
              var returnValue = result;
              popActScope(prevActScopeDepth);
              if (actScopeDepth === 0) {
                var _queue = ReactCurrentActQueue.current;
                if (_queue !== null) {
                  flushActQueue(_queue);
                  ReactCurrentActQueue.current = null;
                }
                var _thenable = {
                  then: function(resolve, reject) {
                    if (ReactCurrentActQueue.current === null) {
                      ReactCurrentActQueue.current = [];
                      recursivelyFlushAsyncActWork(returnValue, resolve, reject);
                    } else {
                      resolve(returnValue);
                    }
                  }
                };
                return _thenable;
              } else {
                var _thenable2 = {
                  then: function(resolve, reject) {
                    resolve(returnValue);
                  }
                };
                return _thenable2;
              }
            }
          }
        }
        function popActScope(prevActScopeDepth) {
          {
            if (prevActScopeDepth !== actScopeDepth - 1) {
              error("You seem to have overlapping act() calls, this is not supported. Be sure to await previous act() calls before making a new one. ");
            }
            actScopeDepth = prevActScopeDepth;
          }
        }
        function recursivelyFlushAsyncActWork(returnValue, resolve, reject) {
          {
            var queue = ReactCurrentActQueue.current;
            if (queue !== null) {
              try {
                flushActQueue(queue);
                enqueueTask(function() {
                  if (queue.length === 0) {
                    ReactCurrentActQueue.current = null;
                    resolve(returnValue);
                  } else {
                    recursivelyFlushAsyncActWork(returnValue, resolve, reject);
                  }
                });
              } catch (error2) {
                reject(error2);
              }
            } else {
              resolve(returnValue);
            }
          }
        }
        var isFlushing = false;
        function flushActQueue(queue) {
          {
            if (!isFlushing) {
              isFlushing = true;
              var i2 = 0;
              try {
                for (; i2 < queue.length; i2++) {
                  var callback = queue[i2];
                  do {
                    callback = callback(true);
                  } while (callback !== null);
                }
                queue.length = 0;
              } catch (error2) {
                queue = queue.slice(i2 + 1);
                throw error2;
              } finally {
                isFlushing = false;
              }
            }
          }
        }
        var createElement$1 = createElementWithValidation;
        var cloneElement$1 = cloneElementWithValidation;
        var createFactory = createFactoryWithValidation;
        var Children = {
          map: mapChildren,
          forEach: forEachChildren,
          count: countChildren,
          toArray: toArray2,
          only: onlyChild
        };
        exports.Children = Children;
        exports.Component = Component;
        exports.Fragment = REACT_FRAGMENT_TYPE;
        exports.Profiler = REACT_PROFILER_TYPE;
        exports.PureComponent = PureComponent;
        exports.StrictMode = REACT_STRICT_MODE_TYPE;
        exports.Suspense = REACT_SUSPENSE_TYPE;
        exports.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = ReactSharedInternals;
        exports.act = act;
        exports.cloneElement = cloneElement$1;
        exports.createContext = createContext;
        exports.createElement = createElement$1;
        exports.createFactory = createFactory;
        exports.createRef = createRef;
        exports.forwardRef = forwardRef2;
        exports.isValidElement = isValidElement;
        exports.lazy = lazy;
        exports.memo = memo2;
        exports.startTransition = startTransition;
        exports.unstable_act = act;
        exports.useCallback = useCallback2;
        exports.useContext = useContext;
        exports.useDebugValue = useDebugValue2;
        exports.useDeferredValue = useDeferredValue;
        exports.useEffect = useEffect2;
        exports.useId = useId;
        exports.useImperativeHandle = useImperativeHandle;
        exports.useInsertionEffect = useInsertionEffect;
        exports.useLayoutEffect = useLayoutEffect;
        exports.useMemo = useMemo;
        exports.useReducer = useReducer;
        exports.useRef = useRef;
        exports.useState = useState2;
        exports.useSyncExternalStore = useSyncExternalStore;
        exports.useTransition = useTransition;
        exports.version = ReactVersion;
        if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ !== "undefined" && typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop === "function") {
          __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop(new Error());
        }
      })();
    }
  }
});

// node_modules/react/index.js
var require_react = __commonJS({
  "node_modules/react/index.js"(exports, module) {
    "use strict";
    if (false) {
      module.exports = null;
    } else {
      module.exports = require_react_development();
    }
  }
});

// node_modules/use-sync-external-store/cjs/use-sync-external-store-shim.development.js
var require_use_sync_external_store_shim_development = __commonJS({
  "node_modules/use-sync-external-store/cjs/use-sync-external-store-shim.development.js"(exports) {
    "use strict";
    (function() {
      function is(x2, y2) {
        return x2 === y2 && (0 !== x2 || 1 / x2 === 1 / y2) || x2 !== x2 && y2 !== y2;
      }
      function useSyncExternalStore$2(subscribe, getSnapshot) {
        didWarnOld18Alpha || void 0 === React2.startTransition || (didWarnOld18Alpha = true, console.error(
          "You are using an outdated, pre-release alpha of React 18 that does not support useSyncExternalStore. The use-sync-external-store shim will not work correctly. Upgrade to a newer pre-release."
        ));
        var value = getSnapshot();
        if (!didWarnUncachedGetSnapshot) {
          var cachedValue = getSnapshot();
          objectIs(value, cachedValue) || (console.error(
            "The result of getSnapshot should be cached to avoid an infinite loop"
          ), didWarnUncachedGetSnapshot = true);
        }
        cachedValue = useState2({
          inst: { value, getSnapshot }
        });
        var inst = cachedValue[0].inst, forceUpdate = cachedValue[1];
        useLayoutEffect(
          function() {
            inst.value = value;
            inst.getSnapshot = getSnapshot;
            checkIfSnapshotChanged(inst) && forceUpdate({ inst });
          },
          [subscribe, value, getSnapshot]
        );
        useEffect2(
          function() {
            checkIfSnapshotChanged(inst) && forceUpdate({ inst });
            return subscribe(function() {
              checkIfSnapshotChanged(inst) && forceUpdate({ inst });
            });
          },
          [subscribe]
        );
        useDebugValue2(value);
        return value;
      }
      function checkIfSnapshotChanged(inst) {
        var latestGetSnapshot = inst.getSnapshot;
        inst = inst.value;
        try {
          var nextValue = latestGetSnapshot();
          return !objectIs(inst, nextValue);
        } catch (error) {
          return true;
        }
      }
      function useSyncExternalStore$1(subscribe, getSnapshot) {
        return getSnapshot();
      }
      "undefined" !== typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ && "function" === typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart && __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart(Error());
      var React2 = require_react(), objectIs = "function" === typeof Object.is ? Object.is : is, useState2 = React2.useState, useEffect2 = React2.useEffect, useLayoutEffect = React2.useLayoutEffect, useDebugValue2 = React2.useDebugValue, didWarnOld18Alpha = false, didWarnUncachedGetSnapshot = false, shim = "undefined" === typeof window || "undefined" === typeof window.document || "undefined" === typeof window.document.createElement ? useSyncExternalStore$1 : useSyncExternalStore$2;
      exports.useSyncExternalStore = void 0 !== React2.useSyncExternalStore ? React2.useSyncExternalStore : shim;
      "undefined" !== typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ && "function" === typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop && __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop(Error());
    })();
  }
});

// node_modules/use-sync-external-store/shim/index.js
var require_shim = __commonJS({
  "node_modules/use-sync-external-store/shim/index.js"(exports, module) {
    "use strict";
    if (false) {
      module.exports = null;
    } else {
      module.exports = require_use_sync_external_store_shim_development();
    }
  }
});

// node_modules/use-sync-external-store/cjs/use-sync-external-store-shim/with-selector.development.js
var require_with_selector_development = __commonJS({
  "node_modules/use-sync-external-store/cjs/use-sync-external-store-shim/with-selector.development.js"(exports) {
    "use strict";
    (function() {
      function is(x2, y2) {
        return x2 === y2 && (0 !== x2 || 1 / x2 === 1 / y2) || x2 !== x2 && y2 !== y2;
      }
      "undefined" !== typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ && "function" === typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart && __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart(Error());
      var React2 = require_react(), shim = require_shim(), objectIs = "function" === typeof Object.is ? Object.is : is, useSyncExternalStore = shim.useSyncExternalStore, useRef = React2.useRef, useEffect2 = React2.useEffect, useMemo = React2.useMemo, useDebugValue2 = React2.useDebugValue;
      exports.useSyncExternalStoreWithSelector = function(subscribe, getSnapshot, getServerSnapshot, selector, isEqual) {
        var instRef = useRef(null);
        if (null === instRef.current) {
          var inst = { hasValue: false, value: null };
          instRef.current = inst;
        } else inst = instRef.current;
        instRef = useMemo(
          function() {
            function memoizedSelector(nextSnapshot) {
              if (!hasMemo) {
                hasMemo = true;
                memoizedSnapshot = nextSnapshot;
                nextSnapshot = selector(nextSnapshot);
                if (void 0 !== isEqual && inst.hasValue) {
                  var currentSelection = inst.value;
                  if (isEqual(currentSelection, nextSnapshot))
                    return memoizedSelection = currentSelection;
                }
                return memoizedSelection = nextSnapshot;
              }
              currentSelection = memoizedSelection;
              if (objectIs(memoizedSnapshot, nextSnapshot))
                return currentSelection;
              var nextSelection = selector(nextSnapshot);
              if (void 0 !== isEqual && isEqual(currentSelection, nextSelection))
                return memoizedSnapshot = nextSnapshot, currentSelection;
              memoizedSnapshot = nextSnapshot;
              return memoizedSelection = nextSelection;
            }
            var hasMemo = false, memoizedSnapshot, memoizedSelection, maybeGetServerSnapshot = void 0 === getServerSnapshot ? null : getServerSnapshot;
            return [
              function() {
                return memoizedSelector(getSnapshot());
              },
              null === maybeGetServerSnapshot ? void 0 : function() {
                return memoizedSelector(maybeGetServerSnapshot());
              }
            ];
          },
          [getSnapshot, getServerSnapshot, selector, isEqual]
        );
        var value = useSyncExternalStore(subscribe, instRef[0], instRef[1]);
        useEffect2(
          function() {
            inst.hasValue = true;
            inst.value = value;
          },
          [value]
        );
        useDebugValue2(value);
        return value;
      };
      "undefined" !== typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ && "function" === typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop && __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop(Error());
    })();
  }
});

// node_modules/use-sync-external-store/shim/with-selector.js
var require_with_selector = __commonJS({
  "node_modules/use-sync-external-store/shim/with-selector.js"(exports, module) {
    "use strict";
    if (false) {
      module.exports = null;
    } else {
      module.exports = require_with_selector_development();
    }
  }
});

// src/components/SearchForm.jsx
var import_react5 = __toESM(require_react(), 1);

// node_modules/lucide-react/dist/esm/createLucideIcon.js
var import_react = __toESM(require_react());

// node_modules/lucide-react/dist/esm/defaultAttributes.js
var defaultAttributes = {
  xmlns: "http://www.w3.org/2000/svg",
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round"
};

// node_modules/lucide-react/dist/esm/createLucideIcon.js
var toKebabCase = (string) => string.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase().trim();
var createLucideIcon = (iconName, iconNode) => {
  const Component = (0, import_react.forwardRef)(
    ({ color = "currentColor", size = 24, strokeWidth = 2, absoluteStrokeWidth, className = "", children, ...rest }, ref) => (0, import_react.createElement)(
      "svg",
      {
        ref,
        ...defaultAttributes,
        width: size,
        height: size,
        stroke: color,
        strokeWidth: absoluteStrokeWidth ? Number(strokeWidth) * 24 / Number(size) : strokeWidth,
        className: ["lucide", `lucide-${toKebabCase(iconName)}`, className].join(" "),
        ...rest
      },
      [
        ...iconNode.map(([tag, attrs]) => (0, import_react.createElement)(tag, attrs)),
        ...Array.isArray(children) ? children : [children]
      ]
    )
  );
  Component.displayName = `${iconName}`;
  return Component;
};

// node_modules/lucide-react/dist/esm/icons/calendar.js
var Calendar = createLucideIcon("Calendar", [
  ["rect", { width: "18", height: "18", x: "3", y: "4", rx: "2", ry: "2", key: "eu3xkr" }],
  ["line", { x1: "16", x2: "16", y1: "2", y2: "6", key: "m3sa8f" }],
  ["line", { x1: "8", x2: "8", y1: "2", y2: "6", key: "18kwsl" }],
  ["line", { x1: "3", x2: "21", y1: "10", y2: "10", key: "xt86sb" }]
]);

// node_modules/lucide-react/dist/esm/icons/map-pin.js
var MapPin = createLucideIcon("MapPin", [
  ["path", { d: "M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z", key: "2oe9fu" }],
  ["circle", { cx: "12", cy: "10", r: "3", key: "ilqhr7" }]
]);

// node_modules/lucide-react/dist/esm/icons/plane.js
var Plane = createLucideIcon("Plane", [
  [
    "path",
    {
      d: "M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z",
      key: "1v9wt8"
    }
  ]
]);

// node_modules/lucide-react/dist/esm/icons/search.js
var Search = createLucideIcon("Search", [
  ["circle", { cx: "11", cy: "11", r: "8", key: "4ej97u" }],
  ["path", { d: "m21 21-4.3-4.3", key: "1qie3q" }]
]);

// node_modules/lucide-react/dist/esm/icons/users.js
var Users = createLucideIcon("Users", [
  ["path", { d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2", key: "1yyitq" }],
  ["circle", { cx: "9", cy: "7", r: "4", key: "nufk8" }],
  ["path", { d: "M22 21v-2a4 4 0 0 0-3-3.87", key: "kshegd" }],
  ["path", { d: "M16 3.13a4 4 0 0 1 0 7.75", key: "1da9ce" }]
]);

// src/api/ryanair.js
var BACKEND_API = (import.meta.env.VITE_API_URL || "http://localhost:8000/api").replace(/\/+$/, "");
var BACKEND_ROOT = BACKEND_API.replace(/\/api$/, "");
var RYANAIR_BLOCK_KEY = "ryanair_hard_blocked";
var _ryanairState = {
  blocked: false,
  chain: Promise.resolve(),
  errorsInRow: 0
};
try {
  const persisted = localStorage.getItem(RYANAIR_BLOCK_KEY);
  if (persisted === "true") {
    _ryanairState.blocked = true;
    console.warn("\u{1F6D1} Ryanair API w stanie BLOKADY (przywr\xF3cono z localStorage). Wstrzymuj\u0119 wszystkie wywo\u0142ania do czasu r\u0119cznego resetu.");
  }
} catch {
}
function _markRyanairBlocked(reason = "Wykryto blokad\u0119 po stronie Ryanair", status) {
  _ryanairState.blocked = true;
  try {
    localStorage.setItem(RYANAIR_BLOCK_KEY, "true");
  } catch {
  }
  const err = new Error(`Ryanair zablokowa\u0142 ruch API. ${reason}. Zresetuj router i kliknij \u201EOdblokuj\u201D w aplikacji.`);
  err.name = "RyanairHardBlockError";
  err.hardBlocked = true;
  if (status) err.status = status;
  console.warn("\u{1F6D1} [HARD BLOCK] Zatrzymuj\u0119 wszystkie zapytania do /ryanair/* a\u017C do r\u0119cznego resetu.", { status });
  throw err;
}
function _isRyanairUrl(url) {
  try {
    const u2 = typeof url === "string" ? new URL(url, window.location.origin) : url;
    return typeof url === "string" ? url.includes("/ryanair/") : (u2.pathname || "").includes("/ryanair/");
  } catch {
    return String(url).includes("/ryanair/");
  }
}
var _activeRequests = 0;
var _waitingResolvers = [];
async function _enqueue(fn) {
  if (_ryanairState.blocked) {
    return _markRyanairBlocked("Stan blokady aktywny");
  }
  await new Promise((resolve) => {
    const tryTake = () => {
      if (_ryanairState.blocked) return resolve(_markRyanairBlocked("Stan blokady aktywny"));
      const max = RATE_LIMIT_CONFIG.maxParallelRequests || 1;
      if (_activeRequests < max) {
        _activeRequests++;
        return resolve();
      }
      _waitingResolvers.push(tryTake);
    };
    tryTake();
  });
  try {
    await smartDelay();
    return await fn();
  } finally {
    _activeRequests = Math.max(0, _activeRequests - 1);
    const next = _waitingResolvers.shift();
    if (next) next();
  }
}
function isRyanairBlocked() {
  return !!_ryanairState.blocked;
}
async function safeRyanairFetch(url, options = {}) {
  if (!_isRyanairUrl(url)) {
    return fetch(url, options);
  }
  return _enqueue(async () => {
    if (_ryanairState.blocked) {
      return _markRyanairBlocked("Stan blokady aktywny");
    }
    let attempt = 0;
    while (true) {
      const res = await fetch(url, options);
      if (res && (res.status === 429 || res.status === 409 || res.status === 403)) {
        _ryanairState.errorsInRow += 1;
        if (_ryanairState.errorsInRow >= 3) {
          _markRyanairBlocked(`HTTP ${res.status}`, res.status);
        }
        if (attempt < (RATE_LIMIT_CONFIG.maxRetries || 0)) {
          attempt += 1;
          await new Promise((r) => setTimeout(r, RATE_LIMIT_CONFIG.retryDelay || 2e3));
          continue;
        }
        return res;
      }
      if (res && res.ok) {
        _ryanairState.errorsInRow = 0;
      }
      try {
        if (res && res.ok && res.headers.get("content-type")?.includes("application/json")) {
          const cloned = res.clone();
          const body = await cloned.json().catch(() => null);
          if (body && (body.error?.includes?.("blocked") || body.message?.includes?.("blocked"))) {
            _ryanairState.errorsInRow += 1;
            if (_ryanairState.errorsInRow >= 3) {
              _markRyanairBlocked("Odpowied\u017A API sygnalizuje blokad\u0119");
            }
          }
        }
      } catch {
      }
      return res;
    }
  });
}
async function ensureBackendUp() {
  try {
    const res = await fetch(`${BACKEND_ROOT}/health`, { method: "GET" });
    if (!res.ok) throw new Error(`Backend health ${res.status}`);
    return true;
  } catch (e2) {
    console.error("Backend (cache/proxy) niedost\u0119pny:", e2);
    throw new Error("Backend niedost\u0119pny \u2013 w\u0142\u0105cz serwer (http://localhost:8000) zanim zaczniesz szuka\u0107.");
  }
}
async function debugCheckPair({ origin: origin2, destination, outDate, inDate, returnAirport, adults = 1, maxPrice = 9999 }) {
  const MET = { apiCalls: 0, fareFinderCalls: 0 };
  const cachedOut = await getFlightsFromCache(origin2, destination, outDate, adults);
  let outFlights = cachedOut !== null ? cachedOut.map((f3) => ({ ...f3, source: "CACHE" })) : null;
  if (!outFlights) {
    MET.apiCalls += 1;
    outFlights = (await searchFlights({ origin: origin2, destination, dateOut: outDate, adults }, MET)).map((f3) => ({ ...f3, source: "API" }));
  }
  const cachedIn = await getFlightsFromCache(destination, returnAirport, inDate, adults);
  let inFlights = cachedIn !== null ? cachedIn.map((f3) => ({ ...f3, source: "CACHE" })) : null;
  if (!inFlights) {
    MET.apiCalls += 1;
    inFlights = (await searchFlights({ origin: destination, destination: returnAirport, dateOut: inDate, adults }, MET)).map((f3) => ({ ...f3, source: "API" }));
  }
  const debugOut = outFlights.filter((f3) => f3.priceInPLN != null && f3.departure && f3.arrival);
  const debugIn = inFlights.filter((f3) => f3.priceInPLN != null && f3.departure && f3.arrival);
  const results = [];
  for (const out of debugOut) {
    for (const inbound of debugIn) {
      const outArrival = /* @__PURE__ */ new Date(`${out.date}T${out.arrival}:00`);
      const inDeparture = /* @__PURE__ */ new Date(`${inbound.date}T${inbound.departure}:00`);
      const diffH = (inDeparture - outArrival) / (1e3 * 60 * 60);
      const total = (out.priceInPLN || 0) + (inbound.priceInPLN || 0);
      const reasons = [];
      if (diffH < 7) reasons.push("czas<7h");
      if (total > maxPrice) reasons.push("cena>max");
      const stayDays = Math.round((new Date(inbound.date) - new Date(out.date)) / (1e3 * 60 * 60 * 24)) + 1;
      if (stayDays < 1) reasons.push("pobyt<1");
      results.push({ outbound: out, inbound, totalPriceInPLN: total, timeDiffHours: diffH, stayDays, accepted: reasons.length === 0, reasons });
    }
  }
  const accepted = results.filter((r) => r.accepted);
  const rejected = results.filter((r) => !r.accepted);
  console.log(`\u{1F50D} debugCheckPair: ${origin2}->${destination} ${outDate} + ${destination}->${returnAirport} ${inDate}`);
  console.log(`   Out flights: ${debugOut.length}, In flights: ${debugIn.length}, Total pairs: ${results.length}`);
  console.log(`   Accepted: ${accepted.length}, Rejected: ${rejected.length}`);
  rejected.slice(0, 20).forEach((r) => console.log(`   \u274C Rejected: ${r.outbound.date} ${r.outbound.arrival} + ${r.inbound.date} ${r.inbound.departure} -> ${r.totalPriceInPLN} PLN; outPrice=${r.outbound.priceInPLN} (${r.outbound.price} ${r.outbound.currency}), inPrice=${r.inbound.priceInPLN} (${r.inbound.price} ${r.inbound.currency}); reasons: ${r.reasons.join(", ")}`));
  accepted.slice(0, 20).forEach((r) => console.log(`   \u2705 Accepted: ${r.outbound.date} ${r.outbound.arrival} + ${r.inbound.date} ${r.inbound.departure} -> ${r.totalPriceInPLN} PLN; outPrice=${r.outbound.priceInPLN} (${r.outbound.price} ${r.outbound.currency}), inPrice=${r.inbound.priceInPLN} (${r.inbound.price} ${r.inbound.currency}); legSources: ${r.outbound.source}/${r.inbound.source}`));
  return { MET, accepted, rejected, results };
}
if (typeof window !== "undefined") {
  window.debugCheckPair = debugCheckPair;
}
var CACHE_DURATION = 60 * 60 * 1e3;
var CACHE_KEY_PREFIX = "ryanair_fare_cache_";
var FLIGHT_CACHE_PREFIX = "ryanair_flight_cache_";
var LAST_METRICS = null;
function getLastMetrics() {
  return LAST_METRICS;
}
var RATE_LIMIT_CONFIG = {
  baseDelay: 300,
  // Podstawowe opóźnienie 300ms między requestami (szybsze domyślnie)
  jitterRange: 200,
  // Losowy jitter ±200ms (200-600ms total)
  retryDelay: 2e3,
  // Opóźnienie po błędzie 409/429
  maxRetries: 2,
  // Maksymalna liczba prób przy błędzie
  maxParallelRequests: 6
  // Maksymalna liczba równoległych requestów do Ryanair (sterowana przez semaphore)
};
async function smartDelay(isRetry = false) {
  const jitter = Math.random() * RATE_LIMIT_CONFIG.jitterRange * 2 - RATE_LIMIT_CONFIG.jitterRange;
  const delay = isRetry ? RATE_LIMIT_CONFIG.retryDelay : RATE_LIMIT_CONFIG.baseDelay + jitter;
  await new Promise((resolve) => setTimeout(resolve, Math.max(100, delay)));
}
function createMetrics() {
  return {
    apiCalls: 0,
    // łączna liczba zapytań HTTP do backendu
    fareFinderCalls: 0,
    // ile z nich to wywołania FareFinder
    totalDays: 0,
    // ile dni analizowaliśmy w sumie
    daysFromCache: 0,
    // ile dni poszło z cache (bez HTTP)
    daysFetched: 0
    // ile dni pobrano z API
  };
}
function timeStrToMinutes(t2) {
  if (!t2 || typeof t2 !== "string") return null;
  const parts = t2.split(":");
  if (parts.length !== 2) return null;
  const hh = parseInt(parts[0], 10);
  const mm = parseInt(parts[1], 10);
  if (Number.isNaN(hh) || Number.isNaN(mm)) return null;
  return hh * 60 + mm;
}
function isTimeBetween(timeStr, fromStr, toStr) {
  if (!timeStr) return false;
  const t2 = timeStrToMinutes(timeStr);
  if (t2 === null) return false;
  const from = timeStrToMinutes(fromStr || "00:00");
  const to = timeStrToMinutes(toStr || "23:59");
  if (from === null || to === null) return false;
  if (from <= to) {
    return t2 >= from && t2 <= to;
  } else {
    return t2 >= from || t2 <= to;
  }
}
function applyTimeFiltersToFlights(flights, filters = {}) {
  if (!filters) return flights;
  const { departureFrom, departureTo, arrivalFrom, arrivalTo } = filters;
  if (!departureFrom && !departureTo && !arrivalFrom && !arrivalTo) return flights;
  return flights.filter((f3) => {
    const depOk = departureFrom || departureTo ? isTimeBetween(f3.departure, departureFrom, departureTo) : true;
    const arrOk = arrivalFrom || arrivalTo ? isTimeBetween(f3.arrival, arrivalFrom, arrivalTo) : true;
    return depOk && arrOk;
  });
}
function isDateMatchingDays(dateStr, daysArray) {
  if (!daysArray || daysArray.length !== 7) return true;
  const d2 = new Date(dateStr);
  if (!d2 || Number.isNaN(d2.getTime())) return true;
  const dow = d2.getDay();
  const idx = dow === 0 ? 6 : dow - 1;
  return !!daysArray[idx];
}
function daysArrayToWeekdayList(daysArray) {
  if (!Array.isArray(daysArray) || daysArray.length !== 7) return null;
  const names = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];
  const sel = [];
  for (let i2 = 0; i2 < 7; i2++) if (daysArray[i2]) sel.push(names[i2]);
  return sel.length > 0 ? sel.join(",") : null;
}
function getCacheKey(params) {
  const { origin: origin2, destination, dateFrom, dateTo, tripType = "oneway", adults = 1 } = params;
  return `${CACHE_KEY_PREFIX}${origin2}-${destination}-${dateFrom}-${dateTo}-${tripType}-${adults}`;
}
function getFlightCacheKey(origin2, destination, date, adults = 1) {
  return `${FLIGHT_CACHE_PREFIX}${origin2}-${destination}-${date}-${adults}`;
}
async function getFlightsFromCache(origin2, destination, date, adults = 1) {
  try {
    const cacheKey = getFlightCacheKey(origin2, destination, date, adults);
    const response = await fetch(`${BACKEND_API}/cache/${encodeURIComponent(cacheKey)}`);
    const result = await response.json();
    if (!result.data) {
      return null;
    }
    const flights = result.data.flights || result.data;
    if (Array.isArray(flights)) {
      return flights.map((f3) => ({
        ...f3,
        source: f3.source || "CACHE",
        origin: f3.origin || origin2,
        destination: f3.destination || destination,
        originName: f3.originName || null,
        destinationName: f3.destinationName || null
      }));
    }
    return flights;
  } catch (e2) {
    console.warn("B\u0142\u0105d odczytu cache lot\xF3w:", e2);
    return null;
  }
}
async function saveFlightsToCache(origin2, destination, date, flights, adults = 1) {
  try {
    const cacheKey = getFlightCacheKey(origin2, destination, date, adults);
    const res = await fetch(`${BACKEND_API}/cache`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cache_key: cacheKey,
        data: { flights },
        ttl: 86400
        // 24 godziny
      })
    });
    if (!res.ok) {
      const t2 = await res.text().catch(() => "");
      console.warn("B\u0142\u0105d zapisu cache lot\xF3w (HTTP):", res.status, t2);
    } else {
      console.log(`\u{1F4BE} [API] Zapisano loty do cache: ${cacheKey} (${flights?.length || 0})`);
    }
  } catch (e2) {
    console.warn("B\u0142\u0105d zapisu cache lot\xF3w:", e2);
  }
}
async function getFromCache(cacheKey) {
  try {
    console.log(`\u{1F50D} Sprawdzam cache dla klucza: ${cacheKey}`);
    const response = await fetch(`${BACKEND_API}/cache/${encodeURIComponent(cacheKey)}`);
    if (!response.ok && response.status >= 500) {
      throw new Error(`Cache backend error ${response.status}`);
    }
    const result = await response.json();
    if (!result.data) {
      console.log("\u274C Brak danych w cache");
      return null;
    }
    const ageSeconds = result.age_seconds || 0;
    const ageMinutes = Math.round(ageSeconds / 60);
    console.log(`\u{1F4E6} Znaleziono w cache (wiek: ${ageMinutes} min, limit: ${Math.round(CACHE_DURATION / 6e4)} min)`);
    const pricesMap = new Map(result.data.prices);
    console.log(`\u2705 Cache aktualny - zwracam ${pricesMap.size} pozycji`);
    return { data: pricesMap, age_seconds: ageSeconds };
  } catch (e2) {
    console.warn("B\u0142\u0105d odczytu cache:", e2);
    return null;
  }
}
async function saveToCache(cacheKey, pricesMap) {
  try {
    const res = await fetch(`${BACKEND_API}/cache`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cache_key: cacheKey,
        data: { prices: Array.from(pricesMap.entries()) },
        ttl: 3600
        // 1 godzina
      })
    });
    if (!res.ok) {
      const t2 = await res.text().catch(() => "");
      console.warn("B\u0142\u0105d zapisu cache (HTTP):", res.status, t2);
    } else {
      console.log(`\u{1F4BE} [API] Zapisano do cache: ${cacheKey} (${pricesMap.size} pozycji)`);
    }
  } catch (e2) {
    console.warn("B\u0142\u0105d zapisu cache:", e2);
  }
}
var EXCHANGE_RATES = {
  PLN: 1,
  EUR: 4.35,
  // Fallback - będzie zaktualizowane z NBP
  GBP: 5.15,
  USD: 4.05,
  CZK: 0.18,
  HUF: 0.011,
  SEK: 0.39,
  NOK: 0.38,
  DKK: 0.58
};
async function fetchExchangeRates() {
  try {
    console.log("Pobieram kursy walut z NBP...");
    const response = await fetch("https://api.nbp.pl/api/exchangerates/tables/A?format=json");
    if (!response.ok) {
      throw new Error(`NBP API error: ${response.status}`);
    }
    const data = await response.json();
    const rates = data[0].rates;
    const newRates = { PLN: 1 };
    rates.forEach((rate) => {
      newRates[rate.code] = rate.mid;
    });
    try {
      const responseB = await fetch("https://api.nbp.pl/api/exchangerates/tables/B?format=json");
      if (responseB.ok) {
        const dataB = await responseB.json();
        const ratesB = dataB[0].rates;
        ratesB.forEach((rate) => {
          newRates[rate.code] = rate.mid;
        });
      }
    } catch (err) {
      console.log("Tabela B (waluty egzotyczne) niedost\u0119pna");
    }
    EXCHANGE_RATES = newRates;
    console.log("Kursy walut zaktualizowane z NBP:", EXCHANGE_RATES);
    return EXCHANGE_RATES;
  } catch (error) {
    console.error("B\u0142\u0105d pobierania kurs\xF3w z NBP:", error);
    console.log("U\u017Cywam kurs\xF3w domy\u015Blnych");
    return EXCHANGE_RATES;
  }
}
fetchExchangeRates();
setInterval(fetchExchangeRates, 60 * 60 * 1e3);
function convertToPLN(amount, currency) {
  if (!amount || !currency) return null;
  const rate = EXCHANGE_RATES[currency.toUpperCase()] || 1;
  return Math.round(amount * rate * 100) / 100;
}
async function searchFlights(params, metrics) {
  const {
    origin: origin2,
    destination,
    dateOut,
    adults = 1,
    teens = 0,
    children = 0,
    infants = 0
  } = params;
  const searchParams = new URLSearchParams({
    ADT: String(adults),
    TEEN: String(teens),
    CHD: String(children),
    INF: String(infants),
    Origin: origin2,
    Destination: destination,
    DateOut: dateOut,
    RoundTrip: "false",
    IncludeConnectingFlights: "false",
    promoCode: "",
    ToUs: "AGREED"
  });
  try {
    await smartDelay();
    const response = await safeRyanairFetch(
      `${BACKEND_API}/ryanair/search?${searchParams}`,
      {
        method: "GET",
        headers: {
          "Accept": "application/json",
          "Accept-Language": "pl"
        }
      }
    );
    if (metrics) metrics.apiCalls += 1;
    if (!response.ok) {
      throw new Error(`B\u0142\u0105d API: ${response.status}`);
    }
    const data = await response.json();
    const parsed = parseFlights(data);
    const annotated = parsed.map((f3) => ({
      ...f3,
      origin: origin2,
      destination,
      originName: null,
      destinationName: null
    }));
    return annotated;
  } catch (error) {
    console.error("B\u0142\u0105d wyszukiwania:", error);
    if (error?.hardBlocked) throw error;
    throw error;
  }
}
function generateDateRange(dateFrom, dateTo) {
  const start = new Date(dateFrom);
  const end = new Date(dateTo);
  const dates = [];
  for (let d2 = new Date(start); d2 <= end; d2.setDate(d2.getDate() + 1)) {
    const yyyy = d2.getFullYear();
    const mm = String(d2.getMonth() + 1).padStart(2, "0");
    const dd = String(d2.getDate()).padStart(2, "0");
    dates.push(`${yyyy}-${mm}-${dd}`);
  }
  return dates;
}
async function searchFlightsRange(params, externalMetrics = null) {
  const METRICS = externalMetrics || createMetrics();
  const { origin: origin2, destination, dateFrom, dateTo, maxPrice, adults = 1, departureFrom, departureTo, arrivalFrom, arrivalTo, departureDays } = params;
  console.log(`Szukam lot\xF3w jednokierunkowych: ${dateFrom} - ${dateTo}, max cena: ${maxPrice || "brak"}`);
  if (!externalMetrics) {
    await ensureBackendUp();
  }
  const availableDates = await getAvailableDates(origin2, destination);
  let allPossibleDates;
  if (availableDates && availableDates.length > 0) {
    const userDateFrom = new Date(dateFrom);
    const userDateTo = new Date(dateTo);
    allPossibleDates = availableDates.filter((dateStr) => {
      const d2 = new Date(dateStr);
      if (!d2 || d2 < userDateFrom || d2 > userDateTo) return false;
      if (departureDays && Array.isArray(departureDays) && departureDays.length === 7) {
        const dow = d2.getDay();
        const idx = dow === 0 ? 6 : dow - 1;
        return !!departureDays[idx];
      }
      return true;
    });
    console.log(`\u26A1 OPTYMALIZACJA: Sprawdzam tylko ${allPossibleDates.length} dni z lotami (zamiast wszystkich dni w zakresie)`);
  } else {
    console.log(`\u26A0\uFE0F Brak danych o dost\u0119pno\u015Bci - sprawdzam wszystkie dni w zakresie`);
    allPossibleDates = generateDateRange(dateFrom, dateTo);
    if (departureDays && Array.isArray(departureDays) && departureDays.length === 7) {
      allPossibleDates = allPossibleDates.filter((dt) => {
        const d2 = new Date(dt);
        const dow = d2.getDay();
        const idx = dow === 0 ? 6 : dow - 1;
        return !!departureDays[idx];
      });
    }
  }
  const cachedDates = [];
  const uncachedDates = [];
  for (const date of allPossibleDates) {
    const cached = await getFlightsFromCache(origin2, destination, date, adults);
    if (cached !== null) {
      cachedDates.push(date);
    } else {
      uncachedDates.push(date);
    }
  }
  console.log(`\u{1F4CA} Status cache: ${cachedDates.length} dni w cache, ${uncachedDates.length} brakuj\u0105cych`);
  let cheapDatesOnly = null;
  let usedFareFinder = false;
  if (maxPrice && uncachedDates.length === 0) {
    console.log(`\u{1F4BE} Wszystkie dni w cache - filtruj\u0119 lokalnie po cenie \u2264 ${maxPrice} PLN (bez FareFinder)`);
    cheapDatesOnly = new Set(cachedDates);
    usedFareFinder = false;
  } else if (maxPrice && uncachedDates.length > 0) {
    console.log(`\u{1F50D} Pr\xF3buj\u0119 optymalizacji przez FareFinder (brakuje ${uncachedDates.length} dni)...`);
    const result = await getMonthlyFaresOneWay({
      origin: origin2,
      destination,
      dateFrom,
      dateTo,
      adults,
      outboundDays: departureDays
    }, METRICS);
    usedFareFinder = true;
    if (result.size > 0) {
      cheapDatesOnly = /* @__PURE__ */ new Set();
      for (const [date, price] of result.entries()) {
        if (price <= maxPrice) {
          cheapDatesOnly.add(date);
        }
      }
      console.log(`\u{1F3AF} OPTYMALIZACJA FareFinder: Znaleziono ${cheapDatesOnly.size} tanich dni (max ${maxPrice} PLN)`);
    } else {
      console.log(`\u26A0\uFE0F FareFinder nie zwr\xF3ci\u0142 danych - wyszukuj\u0119 wszystkie dni i filtruj\u0119 lokalnie`);
      cheapDatesOnly = null;
      usedFareFinder = false;
    }
  }
  let datesToSearch;
  if (maxPrice && cheapDatesOnly !== null) {
    if (usedFareFinder) {
      const farefinderDates = Array.from(cheapDatesOnly);
      console.log(`\u{1F3AF} FareFinder wskaza\u0142 ${farefinderDates.length} tanich dni - sprawdzam cache przed wywo\u0142aniem API...`);
      const cachedFarefinderDates = [];
      const uncachedFarefinderDates = [];
      for (const date of farefinderDates) {
        const cached = await getFlightsFromCache(origin2, destination, date, adults);
        if (cached !== null) {
          cachedFarefinderDates.push(date);
        } else {
          uncachedFarefinderDates.push(date);
        }
      }
      console.log(`\u{1F4CA} FareFinder: ${cachedFarefinderDates.length} dni w cache, ${uncachedFarefinderDates.length} do pobrania`);
      datesToSearch = farefinderDates;
    } else {
      datesToSearch = cachedDates;
      console.log(`\u{1F4BE} Tryb cache: filtruj\u0119 ${datesToSearch.length} dni z cache po cenie`);
    }
  } else {
    datesToSearch = allPossibleDates;
    console.log(`\u{1F4C5} Tryb normalny: szukam wszystkich ${datesToSearch.length} dni${maxPrice ? " i filtruj\u0119 po cenie" : ""}`);
  }
  console.log(`\u{1F4C5} Sprawdzam ${datesToSearch.length} dni...`);
  const results = [];
  const datesToFetch = [];
  let cachedCount = 0;
  for (const date of datesToSearch) {
    const cachedFlights = await getFlightsFromCache(origin2, destination, date, adults);
    if (cachedFlights !== null) {
      let flightsToAdd = cachedFlights.map((f3) => ({ ...f3, source: "CACHE" }));
      if (maxPrice) {
        flightsToAdd = cachedFlights.filter((f3) => {
          const price = f3.priceInPLN || convertToPLN(f3.price, f3.currency);
          return price && price <= maxPrice;
        });
        if (flightsToAdd.length < cachedFlights.length) {
          console.log(`\u{1F4BE}\u{1F4B0} ${date}: ${cachedFlights.length} lot\xF3w w cache, ${flightsToAdd.length} po filtrze \u2264${maxPrice} PLN`);
        }
      }
      const withDates = flightsToAdd.map((f3) => ({ ...f3, searched_date: date }));
      const filteredWithDates = applyTimeFiltersToFlights(withDates, { departureFrom, departureTo, arrivalFrom, arrivalTo });
      results.push(...filteredWithDates);
      if (filteredWithDates.length !== withDates.length) {
        console.log(`\u23F1\uFE0F Filtr godzinowy zastosowany (${withDates.length} -> ${filteredWithDates.length}) dla ${date}`);
      }
      cachedCount++;
    } else {
      datesToFetch.push(date);
    }
  }
  if (cachedCount > 0) {
    console.log(`\u{1F4BE} U\u017Cyto cache dla ${cachedCount} dni, pobieranie ${datesToFetch.length} pozosta\u0142ych...`);
  }
  if (datesToFetch.length > 0) {
    const estimatedTime = Math.round(datesToFetch.length * (RATE_LIMIT_CONFIG.baseDelay / 1e3));
    console.log(`\u23F1\uFE0F Szacowany czas pobierania: ~${estimatedTime}s (${RATE_LIMIT_CONFIG.baseDelay}ms + losowy jitter mi\u0119dzy requestami)`);
  }
  for (let i2 = 0; i2 < datesToFetch.length; i2++) {
    const d2 = datesToFetch[i2];
    if (i2 > 0) {
      await smartDelay();
    }
    let retries = 0;
    let success = false;
    while (!success && retries <= RATE_LIMIT_CONFIG.maxRetries) {
      try {
        const res = await searchFlights({ origin: origin2, destination, dateOut: d2, adults }, METRICS);
        const resWithSource = res.map((f3) => ({ ...f3, source: "API" }));
        await saveFlightsToCache(origin2, destination, d2, resWithSource, adults);
        let flightsToAdd = resWithSource;
        if (maxPrice) {
          flightsToAdd = res.filter((f3) => {
            const price = f3.priceInPLN || convertToPLN(f3.price, f3.currency);
            return price && price <= maxPrice;
          });
          if (flightsToAdd.length < res.length) {
            console.log(`\u{1F4B0} ${d2}: ${res.length} lot\xF3w w cache, ${flightsToAdd.length} po filtrze \u2264${maxPrice} PLN`);
          }
        }
        const withDates = flightsToAdd.map((f3) => ({ ...f3, searched_date: d2 }));
        const filteredWithDates = applyTimeFiltersToFlights(withDates, { departureFrom, departureTo, arrivalFrom, arrivalTo });
        results.push(...filteredWithDates);
        if (filteredWithDates.length !== withDates.length) {
          console.log(`\u23F1\uFE0F Filtr godzinowy zastosowany (${withDates.length} -> ${filteredWithDates.length}) dla ${d2}`);
        }
        success = true;
      } catch (error) {
        if (error?.hardBlocked) {
          throw error;
        }
        const is429 = error.message?.includes("429") || error.message?.includes("Too Many Requests");
        const is409 = error.message?.includes("409") || error.message?.includes("declined");
        if ((is429 || is409) && retries < RATE_LIMIT_CONFIG.maxRetries) {
          retries++;
          console.warn(`\u26A0\uFE0F Rate limit/declined dla ${d2}, pr\xF3ba ${retries}/${RATE_LIMIT_CONFIG.maxRetries}...`);
          await smartDelay(true);
        } else {
          console.warn(`Brak lot\xF3w dla daty ${d2}:`, error.message);
          success = true;
        }
      }
    }
  }
  METRICS.totalDays = datesToSearch.length;
  METRICS.daysFromCache = cachedCount;
  METRICS.daysFetched = datesToFetch.length;
  if (!externalMetrics) {
    LAST_METRICS = {
      ...METRICS,
      percentFromCache: METRICS.totalDays > 0 ? Math.round(METRICS.daysFromCache / METRICS.totalDays * 100) : 0,
      percentFromApi: METRICS.totalDays > 0 ? Math.round(METRICS.daysFetched / METRICS.totalDays * 100) : 0
    };
  }
  console.log(`\u2705 Znaleziono \u0142\u0105cznie ${results.length} lot\xF3w (${cachedCount} z cache, ${datesToFetch.length} z API). API calls: ${METRICS.apiCalls} (FareFinder: ${METRICS.fareFinderCalls})`);
  return results;
}
async function getMonthlyFares(params, metrics) {
  const { origin: origin2, destination, outFrom, outTo, stayDaysMin, stayDaysMax, adults = 1, departureFrom = "00:00", departureTo = "23:59", returnArrivalFrom = "00:00", returnArrivalTo = "23:59", outboundDays = null, inboundDays = null } = params;
  const cacheKey = getCacheKey({
    origin: origin2,
    destination,
    dateFrom: outFrom,
    dateTo: outTo,
    tripType: "round",
    adults
  });
  const cached = await getFromCache(cacheKey);
  if (cached) {
    const ageMinutes = Math.round(cached.age_seconds / 60);
    console.log(`\u{1F4BE} CACHE HIT: U\u017Cywam zapisanych cen dla ${origin2}\u2192${destination} (${ageMinutes} min temu)`);
    return { prices: cached.data, raw: null };
  }
  try {
    const url = `${BACKEND_API}/ryanair/farfinder`;
    const queryParams = new URLSearchParams({
      departureAirportIataCode: origin2,
      arrivalAirportIataCode: destination,
      outboundDepartureDateFrom: outFrom,
      outboundDepartureDateTo: outTo,
      inboundDepartureDateFrom: outFrom,
      // użyj tego samego zakresu
      inboundDepartureDateTo: outTo,
      durationFrom: stayDaysMin,
      durationTo: stayDaysMax,
      adultPaxCount: adults,
      market: "pl-pl",
      searchMode: "ALL"
    });
    if (departureFrom) queryParams.set("outboundDepartureTimeFrom", departureFrom);
    if (departureTo) queryParams.set("outboundDepartureTimeTo", departureTo);
    if (returnArrivalFrom) queryParams.set("inboundDepartureTimeFrom", returnArrivalFrom);
    if (returnArrivalTo) queryParams.set("inboundDepartureTimeTo", returnArrivalTo);
    const outboundList = daysArrayToWeekdayList(outboundDays);
    const inboundList = daysArrayToWeekdayList(inboundDays);
    if (outboundList) queryParams.set("outboundDepartureDaysOfWeek", outboundList);
    if (inboundList) queryParams.set("inboundDepartureDaysOfWeek", inboundList);
    console.log(`\u{1F4CA} Pobieram ceny miesi\u0119czne: ${origin2}\u2192${destination}`);
    await smartDelay();
    const response = await safeRyanairFetch(`${url}?${queryParams}`);
    if (metrics) {
      metrics.apiCalls += 1;
      metrics.fareFinderCalls += 1;
    }
    if (!response.ok) {
      throw new Error(`FareFinder API error: ${response.status}`);
    }
    const data = await response.json();
    if (data.fares && data.fares.length > 0) {
      console.log("\u{1F4CA} Przyk\u0142adowa struktura fare:", JSON.stringify(data.fares[0], null, 2));
    }
    const datePrice = /* @__PURE__ */ new Map();
    if (data.fares && Array.isArray(data.fares)) {
      data.fares.forEach((fare, index) => {
        const outDate = fare.outbound?.departureDate?.split("T")[0] || fare.outbound?.date?.split("T")[0] || fare.departureDate?.split("T")[0];
        const inDate = fare.inbound?.departureDate?.split("T")[0] || fare.inbound?.date?.split("T")[0] || fare.arrivalDate?.split("T")[0];
        const rawOutPrice = fare.outbound?.price?.value ?? fare.outbound?.price ?? fare.price?.outbound ?? 0;
        const outCurrency = fare.outbound?.price?.currencyCode ?? fare.outbound?.price?.currency ?? fare.price?.currency ?? "PLN";
        const outPricePLN = convertToPLN(Number(rawOutPrice) || 0, outCurrency) || Number(rawOutPrice) || 0;
        const rawInPrice = fare.inbound?.price?.value ?? fare.inbound?.price ?? fare.price?.inbound ?? 0;
        const inCurrency = fare.inbound?.price?.currencyCode ?? fare.inbound?.price?.currency ?? fare.price?.currency ?? "PLN";
        const inPricePLN = convertToPLN(Number(rawInPrice) || 0, inCurrency) || Number(rawInPrice) || 0;
        const totalPrice = outPricePLN + inPricePLN;
        if (outDate && inDate) {
          const key = `${outDate}|${inDate}`;
          if (!datePrice.has(key) || datePrice.get(key) > totalPrice) {
            datePrice.set(key, totalPrice);
          }
        } else {
          console.warn(`\u26A0\uFE0F Nie mo\u017Cna wyci\u0105gn\u0105\u0107 dat z fare[${index}]:`, fare);
        }
      });
    }
    console.log(`\u{1F4CA} Znaleziono ${datePrice.size} kombinacji dat z cenami`);
    await saveToCache(cacheKey, datePrice);
    console.log(`\u{1F4BE} Zapisano ceny do cache (wa\u017Cne przez 1h)`);
    return { prices: datePrice, raw: data };
  } catch (error) {
    console.error("B\u0142\u0105d pobierania cen miesi\u0119cznych:", error);
    if (error?.hardBlocked) throw error;
    return { prices: /* @__PURE__ */ new Map(), raw: null };
  }
}
async function getMonthlyFaresOneWay(params, metrics) {
  const { origin: origin2, destination, dateFrom, dateTo, adults = 1, departureFrom = "00:00", departureTo = "23:59", outboundDays = null } = params;
  const cacheKey = getCacheKey({
    origin: origin2,
    destination,
    dateFrom,
    dateTo,
    tripType: "oneway",
    adults
  });
  const cached = await getFromCache(cacheKey);
  if (cached) {
    const ageMinutes = Math.round(cached.age_seconds / 60);
    console.log(`\u{1F4BE} CACHE HIT: U\u017Cywam zapisanych cen dla ${origin2}\u2192${destination} (jednokierunkowe, ${ageMinutes} min temu)`);
    return cached.data;
  }
  try {
    const url = `${BACKEND_API}/ryanair/oneWayFares`;
    const queryParams = new URLSearchParams({
      departureAirportIataCode: origin2,
      arrivalAirportIataCode: destination,
      outboundDepartureDateFrom: dateFrom,
      outboundDepartureDateTo: dateTo,
      outboundDepartureTimeFrom: departureFrom,
      outboundDepartureTimeTo: departureTo,
      adultPaxCount: adults,
      market: "pl-pl",
      searchMode: "ALL"
    });
    const outboundList = daysArrayToWeekdayList(outboundDays);
    if (outboundList) queryParams.set("outboundDepartureDaysOfWeek", outboundList);
    console.log(`\u{1F4CA} Pobieram ceny miesi\u0119czne (jednokierunkowe): ${origin2}\u2192${destination}`);
    await smartDelay();
    const response = await safeRyanairFetch(`${url}?${queryParams}`);
    if (metrics) {
      metrics.apiCalls += 1;
      metrics.fareFinderCalls += 1;
    }
    if (!response.ok) {
      throw new Error(`FareFinder API error: ${response.status}`);
    }
    const data = await response.json();
    const datePrice = /* @__PURE__ */ new Map();
    if (data.fares && Array.isArray(data.fares)) {
      data.fares.forEach((fare) => {
        const outDate = fare.outbound?.departureDate?.split("T")[0];
        const rawOutPrice = fare.outbound?.price?.value ?? fare.outbound?.price ?? 0;
        const outCurrency = fare.outbound?.price?.currencyCode ?? fare.outbound?.price?.currency ?? "PLN";
        const outPrice = convertToPLN(Number(rawOutPrice) || 0, outCurrency) || Number(rawOutPrice) || 0;
        if (outDate && outPrice > 0) {
          if (!datePrice.has(outDate) || datePrice.get(outDate) > outPrice) {
            datePrice.set(outDate, outPrice);
          }
        }
      });
    }
    console.log(`\u{1F4CA} Znaleziono ${datePrice.size} dni z cenami`);
    await saveToCache(cacheKey, datePrice);
    console.log(`\u{1F4BE} Zapisano ceny do cache (wa\u017Cne przez 1h)`);
    return datePrice;
  } catch (error) {
    console.error("B\u0142\u0105d pobierania cen miesi\u0119cznych (jednokierunkowe):", error);
    if (error?.hardBlocked) throw error;
    return /* @__PURE__ */ new Map();
  }
}
async function getMonthlyFaresForRoute(params) {
  return await getMonthlyFaresOneWay(params);
}
async function searchRoundTripRange(params) {
  const {
    origin: origin2,
    destination,
    outFrom,
    outTo,
    stayDaysMin,
    stayDaysMax,
    maxPrice,
    adults = 1,
    allowDifferentReturnAirport = false,
    availableReturnAirports = null,
    departureFrom,
    // outbound departure HH:MM
    departureTo,
    arrivalFrom,
    // outbound arrival HH:MM
    arrivalTo,
    returnDepartureFrom,
    // inbound departure HH:MM (departure from dest)
    returnDepartureTo,
    returnArrivalFrom,
    // inbound arrival HH:MM (arrival at origin)
    returnArrivalTo,
    departureDays,
    // array of booleans for Mon..Sun
    returnDays
  } = params;
  console.log(`Szukam round-trip: ${outFrom} - ${outTo}, pobyt ${stayDaysMin}-${stayDaysMax} dni, max cena: ${maxPrice || "brak"}`);
  let returnAirports = [origin2];
  if (allowDifferentReturnAirport && availableReturnAirports && availableReturnAirports.length > 0) {
    returnAirports = availableReturnAirports;
    console.log(`\u2194\uFE0F MULTI-AIRPORT: Kombinuj\u0119 z ${returnAirports.length} lotniskami powrotu: ${returnAirports.join(", ")}`);
  }
  await ensureBackendUp();
  const METRICS = createMetrics();
  const dateFromObj = new Date(outFrom);
  const dateToObj = new Date(outTo);
  const totalDays = Math.ceil((dateToObj - dateFromObj) / (1e3 * 60 * 60 * 24)) + 1;
  const useFareFinderOptimization = maxPrice && totalDays > 14;
  if (useFareFinderOptimization) {
    if (allowDifferentReturnAirport) {
      console.log(`\u{1F4CA} Zakres: ${totalDays} dni \u2192 OPTYMALIZACJA FareFinder aktywna (multi-airport: ${returnAirports.length} lotnisk powrotu)`);
    } else {
      console.log(`\u{1F4CA} Zakres: ${totalDays} dni \u2192 OPTYMALIZACJA FareFinder aktywna (du\u017Cy zakres)`);
    }
  } else if (maxPrice) {
    console.log(`\u{1F4CA} Zakres: ${totalDays} dni \u2192 Tryb bezpo\u015Bredni (ma\u0142y zakres, optymalizacja FareFinder pomini\u0119ta)`);
  }
  let monthlyPrices = /* @__PURE__ */ new Map();
  let monthlyRawData = null;
  let cheapCombinations = /* @__PURE__ */ new Set();
  if (useFareFinderOptimization) {
    if (allowDifferentReturnAirport) {
      console.log("\u{1F3AF} Multi-airport: Pobieram miesi\u0119czne ceny ONE-WAY (nie round-trip)");
      const outMap = await getMonthlyFaresOneWay({
        origin: origin2,
        destination,
        dateFrom: outFrom,
        dateTo: outTo,
        adults,
        departureFrom,
        departureTo,
        outboundDays: departureDays
      }, METRICS);
      const inMapByAirport = /* @__PURE__ */ new Map();
      for (const returnAirport of returnAirports) {
        const inMap = await getMonthlyFaresOneWay({
          origin: destination,
          destination: returnAirport,
          dateFrom: outFrom,
          dateTo: outTo,
          adults,
          departureFrom: returnDepartureFrom,
          departureTo: returnDepartureTo,
          arrivalFrom: returnArrivalFrom,
          arrivalTo: returnArrivalTo,
          outboundDays: returnDays
        }, METRICS);
        if (inMap.size > 0) {
          inMapByAirport.set(returnAirport, inMap);
        }
      }
      const allPairs = [];
      for (const [outDate, outPrice] of outMap.entries()) {
        const outDateObj = new Date(outDate);
        for (const [returnAirport, inMap] of inMapByAirport.entries()) {
          for (const [inDate, inPrice] of inMap.entries()) {
            const inDateObj = new Date(inDate);
            const stayDays = Math.floor((inDateObj - outDateObj) / (24 * 60 * 60 * 1e3));
            if (stayDays >= stayDaysMin && stayDays <= stayDaysMax && inDateObj > outDateObj) {
              const totalPrice = outPrice + inPrice;
              const key = `${outDate}|${inDate}|${returnAirport}`;
              if (totalPrice <= maxPrice) {
                cheapCombinations.add(key);
                allPairs.push({ outDate, inDate, returnAirport, outPrice, inPrice, totalPrice });
              }
            }
          }
        }
      }
      console.log(`\u{1F3AF} OPTYMALIZACJA (multi-airport): Znaleziono ${cheapCombinations.size} tanich kombinacji (max ${maxPrice} PLN)`);
      if (cheapCombinations.size > 0) {
        console.log(`   Przyk\u0142ady: ${allPairs.slice(0, 3).map((p2) => `${p2.outDate}\u2192${p2.inDate} (${p2.returnAirport}): ${p2.totalPrice} PLN`).join(", ")}`);
      }
    } else {
      const result = await getMonthlyFares({
        origin: origin2,
        destination,
        outFrom,
        outTo,
        stayDaysMin,
        stayDaysMax,
        adults,
        departureFrom,
        departureTo,
        returnArrivalFrom,
        returnArrivalTo
      }, METRICS);
      monthlyPrices = result.prices;
      monthlyRawData = result.raw;
      if (monthlyPrices.size > 0) {
        for (const [key, price] of monthlyPrices.entries()) {
          if (price <= maxPrice) {
            cheapCombinations.add(key);
          }
        }
        console.log(`\u{1F3AF} OPTYMALIZACJA: Znaleziono ${cheapCombinations.size} tanich kombinacji (max ${maxPrice} PLN)`);
      }
    }
  }
  let oneWayCandidatePairs = [];
  if (useFareFinderOptimization && cheapCombinations.size === 0) {
    console.log("\u26A0\uFE0F Brak tanich par z roundTripFares \u2013 pr\xF3buj\u0119 kombinacji z miesi\u0119cznych one-way (outbound + inbound).");
    const outMap = await getMonthlyFaresOneWay({
      origin: origin2,
      destination,
      dateFrom: outFrom,
      dateTo: outTo,
      adults,
      departureFrom,
      departureTo,
      outboundDays: departureDays
    }, METRICS);
    const inMapByAirport = /* @__PURE__ */ new Map();
    for (const returnAirport of returnAirports) {
      const inMap = await getMonthlyFaresOneWay({
        origin: destination,
        destination: returnAirport,
        dateFrom: outFrom,
        dateTo: outTo,
        adults,
        departureFrom: returnDepartureFrom,
        departureTo: returnDepartureTo,
        arrivalFrom: returnArrivalFrom,
        arrivalTo: returnArrivalTo,
        outboundDays: returnDays
      }, METRICS);
      if (inMap.size > 0) {
        inMapByAirport.set(returnAirport, inMap);
      }
    }
    if (outMap.size > 0 && inMapByAirport.size > 0) {
      const candidateMargin = params.oneWayCandidateMargin || 1.3;
      const outDates = Array.from(outMap.keys()).sort();
      for (const [returnAirport, inMap] of inMapByAirport.entries()) {
        const inDates = Array.from(inMap.keys()).sort();
        const inSet = new Set(inDates);
        for (const od of outDates) {
          const oDate = new Date(od);
          for (let stay = stayDaysMin; stay <= stayDaysMax; stay++) {
            const candInDate = new Date(oDate);
            candInDate.setDate(candInDate.getDate() + (stay - 1));
            const yyyy = candInDate.getFullYear();
            const mm = String(candInDate.getMonth() + 1).padStart(2, "0");
            const dd = String(candInDate.getDate()).padStart(2, "0");
            const id = `${yyyy}-${mm}-${dd}`;
            if (!inSet.has(id)) continue;
            const total = (outMap.get(od) || 0) + (inMap.get(id) || 0);
            if (total > 0 && (!maxPrice || total <= maxPrice * candidateMargin)) {
              oneWayCandidatePairs.push({
                outDate: od,
                inDate: id,
                approxTotalPLN: total,
                stayDays: stay,
                returnAirport
                // Dodaj info o lotnisku powrotu
              });
            }
          }
        }
      }
      oneWayCandidatePairs.sort((a2, b3) => a2.approxTotalPLN - b3.approxTotalPLN);
      console.log(`\u{1F4CA} Znaleziono ${oneWayCandidatePairs.length} mo\u017Cliwych par do sprawdzenia (wszystkie lotniska razem).`);
      const neededOutDates = new Set(oneWayCandidatePairs.map((p2) => p2.outDate).filter((d2) => {
        if (!departureDays || !Array.isArray(departureDays) || departureDays.length !== 7) return true;
        return isDateMatchingDays(d2, departureDays);
      }));
      const neededInDates = new Set(oneWayCandidatePairs.map((p2) => p2.inDate).filter((d2) => {
        if (!returnDays || !Array.isArray(returnDays) || returnDays.length !== 7) return true;
        return isDateMatchingDays(d2, returnDays);
      }));
      const outboundByDate = /* @__PURE__ */ new Map();
      let cachedOut = 0, fetchedOut = 0;
      let outErrorsInARow = 0;
      let outApiCallCount = 0;
      for (const d2 of neededOutDates) {
        if (outErrorsInARow >= 3) {
          console.warn("\u{1F6D1} Circuit breaker: Zbyt wiele b\u0142\u0119d\xF3w z rz\u0119du dla lot\xF3w TAM \u2013 przerywam dalsze pobieranie, aby unikn\u0105\u0107 blokady IP.");
          console.warn("   \u{1F4A1} Spr\xF3buj ponownie za kilka minut lub zmniejsz zakres dat.");
          break;
        }
        const cached = await getFlightsFromCache(origin2, destination, d2, adults);
        if (cached !== null) {
          const cachedWithSource = cached.map((f3) => ({ ...f3, source: "CACHE" }));
          const filteredCached = applyTimeFiltersToFlights(cachedWithSource, { departureFrom, departureTo, arrivalFrom, arrivalTo });
          outboundByDate.set(d2, filteredCached);
          cachedOut++;
          outErrorsInARow = 0;
          continue;
        }
        if (outApiCallCount > 0) {
          await smartDelay();
        }
        outApiCallCount++;
        let retries = 0;
        let success = false;
        while (!success && retries <= RATE_LIMIT_CONFIG.maxRetries) {
          try {
            const res = await searchFlights({ origin: origin2, destination, dateOut: d2, adults }, METRICS);
            const resWithSource = res.map((f3) => ({ ...f3, source: "API" }));
            await saveFlightsToCache(origin2, destination, d2, resWithSource, adults);
            const filteredRes = applyTimeFiltersToFlights(resWithSource, { departureFrom, departureTo, arrivalFrom, arrivalTo });
            outboundByDate.set(d2, filteredRes);
            fetchedOut++;
            outErrorsInARow = 0;
            success = true;
          } catch (e2) {
            if (e2?.hardBlocked) {
              throw e2;
            }
            const is429 = e2.message?.includes("429") || e2.message?.includes("Too Many Requests");
            const is409 = e2.message?.includes("409") || e2.message?.includes("declined");
            if ((is429 || is409) && retries < RATE_LIMIT_CONFIG.maxRetries) {
              retries++;
              console.warn(`  \u26A0\uFE0F ${origin2}\u2192${destination} rate limit/declined, pr\xF3ba ${retries}/${RATE_LIMIT_CONFIG.maxRetries}...`);
              await smartDelay(true);
            } else {
              console.warn(`\u274C B\u0142\u0105d pobrania lot\xF3w TAM dla ${d2}:`, e2.message);
              outboundByDate.set(d2, []);
              outErrorsInARow++;
              success = true;
            }
          }
        }
      }
      const inboundByDateAndAirport = /* @__PURE__ */ new Map();
      let cachedIn = 0, fetchedIn = 0;
      let inErrorsInARow = 0;
      let inApiCallCount = 0;
      for (const d2 of neededInDates) {
        if (inErrorsInARow >= 3) {
          console.warn("\u{1F6D1} Circuit breaker: Zbyt wiele b\u0142\u0119d\xF3w z rz\u0119du dla lot\xF3w POWR\xD3T \u2013 przerywam dalsze pobieranie, aby unikn\u0105\u0107 blokady IP.");
          console.warn("   \u{1F4A1} Spr\xF3buj ponownie za kilka minut lub zmniejsz zakres dat.");
          break;
        }
        const flightsByAirport = /* @__PURE__ */ new Map();
        let airportCallsInThisDate = 0;
        for (const returnAirport of returnAirports) {
          const cached = await getFlightsFromCache(destination, returnAirport, d2, adults);
          if (cached !== null) {
            const cachedWithSource = cached.map((f3) => ({ ...f3, source: "CACHE" }));
            const filteredCached = applyTimeFiltersToFlights(cachedWithSource, { arrivalFrom: returnArrivalFrom, arrivalTo: returnArrivalTo });
            flightsByAirport.set(returnAirport, filteredCached);
            cachedIn++;
            inErrorsInARow = 0;
            continue;
          }
          if (inApiCallCount > 0 || airportCallsInThisDate > 0) {
            await smartDelay();
          }
          inApiCallCount++;
          airportCallsInThisDate++;
          let retries = 0;
          let success = false;
          while (!success && retries <= RATE_LIMIT_CONFIG.maxRetries) {
            try {
              const res = await searchFlights({ origin: destination, destination: returnAirport, dateOut: d2, adults }, METRICS);
              const resWithSource = res.map((f3) => ({ ...f3, source: "API" }));
              await saveFlightsToCache(destination, returnAirport, d2, resWithSource, adults);
              const filteredRes = applyTimeFiltersToFlights(resWithSource, { arrivalFrom: returnArrivalFrom, arrivalTo: returnArrivalTo });
              flightsByAirport.set(returnAirport, filteredRes);
              fetchedIn++;
              inErrorsInARow = 0;
              success = true;
            } catch (e2) {
              if (e2?.hardBlocked) {
                throw e2;
              }
              const is429 = e2.message?.includes("429") || e2.message?.includes("Too Many Requests");
              const is409 = e2.message?.includes("409") || e2.message?.includes("declined");
              if ((is429 || is409) && retries < RATE_LIMIT_CONFIG.maxRetries) {
                retries++;
                console.warn(`  \u26A0\uFE0F ${destination}\u2192${returnAirport} rate limit/declined, pr\xF3ba ${retries}/${RATE_LIMIT_CONFIG.maxRetries}...`);
                await smartDelay(true);
              } else {
                console.warn(`\u274C B\u0142\u0105d pobrania lot\xF3w POWR\xD3T ${destination}\u2192${returnAirport} dla ${d2}:`, e2.message);
                flightsByAirport.set(returnAirport, []);
                inErrorsInARow++;
                success = true;
              }
            }
          }
        }
        inboundByDateAndAirport.set(d2, flightsByAirport);
      }
      const combos = [];
      let rejectedByTime2 = 0, rejectedByPrice = 0, rejectedByStayDays = 0;
      for (const p2 of oneWayCandidatePairs) {
        const outs = (outboundByDate.get(p2.outDate) || []).filter((f3) => f3.priceInPLN != null && f3.departure && f3.arrival);
        const flightsByAirport = inboundByDateAndAirport.get(p2.inDate);
        if (!flightsByAirport) {
          console.log(`   \u26A0\uFE0F Brak lot\xF3w POWR\xD3T dla daty ${p2.inDate}`);
          continue;
        }
        if (outs.length === 0) {
          console.log(`   \u26A0\uFE0F Brak lot\xF3w TAM dla daty ${p2.outDate}`);
          continue;
        }
        const returnAirport = p2.returnAirport;
        const insFlights = flightsByAirport.get(returnAirport);
        if (!insFlights) {
          console.log(`   \u26A0\uFE0F Brak lot\xF3w POWR\xD3T dla lotniska ${returnAirport} w dacie ${p2.inDate}`);
          continue;
        }
        const ins = (insFlights || []).filter((f3) => f3.priceInPLN != null && f3.departure && f3.arrival);
        if (ins.length === 0) continue;
        for (const outFlight of outs) {
          for (const inFlight of ins) {
            const outArrivalTime = /* @__PURE__ */ new Date(`${outFlight.date}T${outFlight.arrival}:00`);
            const inDepartureTime = /* @__PURE__ */ new Date(`${inFlight.date}T${inFlight.departure}:00`);
            const timeDiffMs = inDepartureTime - outArrivalTime;
            const timeDiffHours = timeDiffMs / (1e3 * 60 * 60);
            if (timeDiffHours < 7) {
              rejectedByTime2++;
              console.log(`   \u274C ODRZUCONO (czas<7h) [cheapCombin]: out ${outFlight.date} ${outFlight.arrival} (arr) - in ${inFlight.date} ${inFlight.departure} (dep); diff ${timeDiffHours.toFixed(2)}h; outPrice ${outFlight.priceInPLN}, inPrice ${inFlight.priceInPLN}; origin ${outFlight.origin} -> ${outFlight.destination} / return ${inFlight.origin}->${inFlight.destination} (returnAirport=${returnAirport})`);
              continue;
            }
            const total = (outFlight.priceInPLN || 0) + (inFlight.priceInPLN || 0);
            if (maxPrice && total > maxPrice) {
              rejectedByPrice++;
              console.log(`   \u274C ODRZUCONO (cena>max) [cheapCombin]: out ${outFlight.date} ${outFlight.arrival} + in ${inFlight.date} ${inFlight.departure} -> total ${total} PLN > ${maxPrice} PLN; origin ${outFlight.origin} -> ${outFlight.destination}; returnAirport=${returnAirport}`);
              if (p2.outDate === "2025-12-15" && p2.inDate === "2025-12-18" && returnAirport === "POZ") {
                console.log(`   \u{1F50D} LCJ\u2192AGP\u2192POZ (15\u219218): ${outFlight.priceInPLN} + ${inFlight.priceInPLN} = ${total} PLN > ${maxPrice} PLN \u274C`);
              }
              continue;
            }
            combos.push({
              outbound: outFlight,
              inbound: inFlight,
              totalPriceInPLN: total,
              stayDays: p2.stayDays,
              outDate: p2.outDate,
              inDate: p2.inDate,
              returnAirport,
              originAirport: outFlight.origin,
              originName: outFlight.originName || "",
              returnName: inFlight.destinationName || "",
              source: outFlight.source === "API" && inFlight.source === "API" ? "API" : outFlight.source === "CACHE" && inFlight.source === "CACHE" ? "CACHE" : "MIXED"
            });
            console.log(`   \u2705 Zaakceptowano [cheapCombin]: ${outFlight.origin}->${outFlight.destination} ${p2.outDate} (${outFlight.arrival}) + ${inFlight.origin}->${inFlight.destination} ${p2.inDate} (${inFlight.departure}) = ${total} PLN; legSources: ${outFlight.source || "UNKNOWN"}/${inFlight.source || "UNKNOWN"}; comboSource: ${outFlight.source === "API" && inFlight.source === "API" ? "API" : outFlight.source === "CACHE" && inFlight.source === "CACHE" ? "CACHE" : "MIXED"}`);
          }
        }
      }
      combos.sort((a2, b3) => a2.totalPriceInPLN - b3.totalPriceInPLN);
      console.log(`\u{1F4CA} \u0141\u0105czenie: ${oneWayCandidatePairs.length} par \u2192 ${combos.length} kombinacji`);
      if (rejectedByTime2 > 0 || rejectedByPrice > 0) {
        console.log(`   \u274C Odrzucono: ${rejectedByTime2} (< 7h), ${rejectedByPrice} (cena > ${maxPrice})`);
      }
      const totalInboundRequests = neededInDates.size * returnAirports.length;
      METRICS.totalDays = neededOutDates.size + totalInboundRequests;
      METRICS.daysFromCache = cachedOut + cachedIn;
      METRICS.daysFetched = fetchedOut + fetchedIn;
      LAST_METRICS = {
        ...METRICS,
        percentFromCache: METRICS.totalDays > 0 ? Math.round(METRICS.daysFromCache / METRICS.totalDays * 100) : 0,
        percentFromApi: METRICS.totalDays > 0 ? Math.round(METRICS.daysFetched / METRICS.totalDays * 100) : 0
      };
      if (combos.length > 0) {
        console.log(`\u2705 Round-trip (one-way optymalizacja): gotowe ${combos.length} par \u2264 ${maxPrice} PLN. API calls: ${METRICS.apiCalls} (FareFinder: ${METRICS.fareFinderCalls})`);
        if (returnAirports.length > 1) {
          console.log(`   \u{1F4CA} Multi-airport: ${neededOutDates.size} dni TAM + ${neededInDates.size} dni \xD7 ${returnAirports.length} lotnisk = ${METRICS.totalDays} zapyta\u0144 total`);
        }
        return combos;
      } else {
        const estimatedApiCalls = oneWayCandidatePairs.length * 2;
        if (maxPrice && estimatedApiCalls > 20) {
          LAST_METRICS = {
            ...METRICS,
            percentFromCache: METRICS.totalDays > 0 ? Math.round(METRICS.daysFromCache / METRICS.totalDays * 100) : 0,
            percentFromApi: METRICS.totalDays > 0 ? Math.round(METRICS.daysFetched / METRICS.totalDays * 100) : 0,
            skippedFullScan: true,
            note: `Brak potwierdzonych par <= maxPrice w Fallback 1, pe\u0142ny skan (${estimatedApiCalls} API calls) zbyt du\u017Cy.`
          };
          console.log(`\u{1F6D1} Brak par <= ${maxPrice} PLN w Fallback 1, pe\u0142ny skan wymaga\u0142by ~${estimatedApiCalls} API calls \u2013 SKIP.`);
          return [];
        }
        console.log(`\u26A0\uFE0F Brak par <= ${maxPrice} PLN w Fallback 1 (monthly estimates), ale spr\xF3buj\u0119 pe\u0142ny skan (${estimatedApiCalls} API calls).`);
      }
    } else {
      console.log("\u26A0\uFE0F Miesi\u0119czne one-way zwr\xF3ci\u0142y puste dane \u2013 przechodz\u0119 do trybu pe\u0142nego.");
    }
  }
  if (useFareFinderOptimization && cheapCombinations.size === 0) {
    const estimatedFullScanCalls = totalDays * returnAirports.length * 2;
    const threshold = returnAirports.length > 1 ? 50 : 100;
    if (estimatedFullScanCalls > threshold) {
      LAST_METRICS = {
        ...METRICS,
        percentFromCache: METRICS.totalDays > 0 ? Math.round(METRICS.daysFromCache / METRICS.totalDays * 100) : 0,
        percentFromApi: METRICS.totalDays > 0 ? Math.round(METRICS.daysFetched / METRICS.totalDays * 100) : 0,
        skippedFullScan: true,
        note: `Brak tanich par w FareFinder, pe\u0142ny skan (${estimatedFullScanCalls} API calls) przekracza limit ${threshold}.`
      };
      console.log(`\u{1F6D1} Brak par <= ${maxPrice} PLN w FareFinder, pe\u0142ny skan wymaga\u0142by ~${estimatedFullScanCalls} API calls (limit: ${threshold}) \u2013 SKIP.`);
      return [];
    }
    console.log(`\u26A0\uFE0F Brak par <= ${maxPrice} PLN w FareFinder (monthly estimates), ale zakres ma\u0142y (${estimatedFullScanCalls} API calls) \u2013 pr\xF3buj\u0119 pe\u0142ny skan.`);
  }
  let outboundFlights = [];
  let outCached = 0, outFetched = 0;
  if (cheapCombinations.size > 0) {
    const cheapOutDates = /* @__PURE__ */ new Set();
    for (const combo of cheapCombinations) {
      const parts = combo.split("|");
      const outDate = parts[0];
      if (departureDays && Array.isArray(departureDays) && departureDays.length === 7) {
        if (isDateMatchingDays(outDate, departureDays)) {
          cheapOutDates.add(outDate);
        }
      } else {
        cheapOutDates.add(outDate);
      }
    }
    console.log(`\u{1F3AF} Szukam lot\xF3w TAM tylko dla ${cheapOutDates.size} tanich dni: ${Array.from(cheapOutDates).join(", ")}`);
    console.log(`\u{1F4CA} Oszcz\u0119dno\u015B\u0107: ${totalDays - cheapOutDates.size} dni pomini\u0119to dzi\u0119ki FareFinder`);
    let apiCallCount = 0;
    for (const date of cheapOutDates) {
      const cachedFlights = await getFlightsFromCache(origin2, destination, date, adults);
      if (cachedFlights !== null) {
        console.log(`  \u2705 ${date}: ${cachedFlights.length} lot\xF3w z cache`);
        const cachedWithSource = cachedFlights.map((f3) => ({ ...f3, source: "CACHE" }));
        outboundFlights.push(...cachedWithSource);
        outCached++;
        continue;
      }
      if (apiCallCount > 0) {
        await smartDelay();
      }
      apiCallCount++;
      let retries = 0;
      let success = false;
      while (!success && retries <= RATE_LIMIT_CONFIG.maxRetries) {
        try {
          const flights = await searchFlights({
            origin: origin2,
            destination,
            dateOut: date,
            adults
          }, METRICS);
          console.log(`  \u{1F4E1} ${date}: ${flights.length} lot\xF3w z API`);
          const flightsWithSource = flights.map((f3) => ({ ...f3, source: "API" }));
          await saveFlightsToCache(origin2, destination, date, flightsWithSource, adults);
          outboundFlights.push(...flightsWithSource);
          outFetched++;
          success = true;
        } catch (error) {
          if (error?.hardBlocked) {
            throw error;
          }
          const is429 = error.message?.includes("429") || error.message?.includes("Too Many Requests");
          const is409 = error.message?.includes("409") || error.message?.includes("declined");
          if ((is429 || is409) && retries < RATE_LIMIT_CONFIG.maxRetries) {
            retries++;
            console.warn(`  \u26A0\uFE0F Rate limit/declined, pr\xF3ba ${retries}/${RATE_LIMIT_CONFIG.maxRetries}...`);
            await smartDelay(true);
          } else {
            console.warn(`  \u274C ${date}: ${error.message}`);
            success = true;
          }
        }
      }
    }
  } else {
    outboundFlights = await searchFlightsRange({
      origin: origin2,
      destination,
      dateFrom: outFrom,
      dateTo: outTo,
      adults,
      departureFrom,
      departureTo,
      arrivalFrom,
      arrivalTo,
      departureDays
    }, METRICS);
    outboundFlights = outboundFlights.map((f3) => ({ ...f3, source: f3.source || "CACHE" }));
  }
  console.log(`Znaleziono ${outboundFlights.length} lot\xF3w TAM`);
  let inboundFlights = [];
  let inCached = 0, inFetched = 0;
  if (cheapCombinations.size > 0) {
    const cheapInPairs = /* @__PURE__ */ new Map();
    for (const combo of cheapCombinations) {
      const parts = combo.split("|");
      const inDate = parts[1];
      const returnAirport = parts.length === 3 ? parts[2] : origin2;
      if (returnDays && Array.isArray(returnDays) && returnDays.length === 7) {
        if (!isDateMatchingDays(inDate, returnDays)) {
          continue;
        }
      }
      if (!cheapInPairs.has(returnAirport)) {
        cheapInPairs.set(returnAirport, /* @__PURE__ */ new Set());
      }
      cheapInPairs.get(returnAirport).add(inDate);
    }
    const totalInDates = Array.from(cheapInPairs.values()).reduce((sum, set) => sum + set.size, 0);
    console.log(`\u{1F3AF} Szukam lot\xF3w POWR\xD3T dla ${cheapInPairs.size} lotnisk (${totalInDates} unikalnych dni razem)`);
    console.log(`\u{1F4CA} Oszcz\u0119dno\u015B\u0107: ${totalDays - totalInDates} dni pomini\u0119to dzi\u0119ki FareFinder`);
    let apiCallCount = 0;
    for (const [returnAirport, dates] of cheapInPairs.entries()) {
      for (const date of dates) {
        const cachedFlights = await getFlightsFromCache(destination, returnAirport, date, adults);
        if (cachedFlights !== null) {
          console.log(`  \u2705 ${date} (\u2192${returnAirport}): ${cachedFlights.length} lot\xF3w z cache`);
          const cachedWithSource = cachedFlights.map((f3) => ({ ...f3, source: "CACHE" }));
          inboundFlights.push(...cachedWithSource);
          inCached++;
          continue;
        }
        if (apiCallCount > 0) {
          await smartDelay();
        }
        apiCallCount++;
        let retries = 0;
        let success = false;
        while (!success && retries <= RATE_LIMIT_CONFIG.maxRetries) {
          try {
            const flights = await searchFlights({
              origin: destination,
              destination: returnAirport,
              dateOut: date,
              adults
            }, METRICS);
            console.log(`  \u{1F4E1} ${date} (\u2192${returnAirport}): ${flights.length} lot\xF3w z API`);
            const flightsWithSource = flights.map((f3) => ({ ...f3, source: "API" }));
            await saveFlightsToCache(destination, returnAirport, date, flightsWithSource, adults);
            inboundFlights.push(...flightsWithSource);
            inFetched++;
            success = true;
          } catch (error) {
            if (error?.hardBlocked) {
              throw error;
            }
            const is429 = error.message?.includes("429") || error.message?.includes("Too Many Requests");
            const is409 = error.message?.includes("409") || error.message?.includes("declined");
            if ((is429 || is409) && retries < RATE_LIMIT_CONFIG.maxRetries) {
              retries++;
              console.warn(`  \u26A0\uFE0F Rate limit/declined, pr\xF3ba ${retries}/${RATE_LIMIT_CONFIG.maxRetries}...`);
              await smartDelay(true);
            } else {
              console.warn(`  \u274C ${date} (\u2192${returnAirport}): ${error.message}`);
              success = true;
            }
          }
        }
      }
    }
  } else {
    for (const returnAirport of returnAirports) {
      const flights = await searchFlightsRange({
        origin: destination,
        destination: returnAirport,
        dateFrom: outFrom,
        dateTo: outTo,
        adults,
        departureFrom: returnDepartureFrom,
        departureTo: returnDepartureTo,
        arrivalFrom: returnArrivalFrom,
        arrivalTo: returnArrivalTo,
        departureDays: returnDays
      }, METRICS);
      inboundFlights.push(...flights.map((f3) => ({ ...f3, source: f3.source || "CACHE" })));
    }
  }
  console.log(`Znaleziono ${inboundFlights.length} lot\xF3w POWR\xD3T`);
  const combinations = [];
  let rejectedByTime = 0;
  let rejectedByStay = 0;
  let rejectedByCombo = 0;
  for (const outFlight of outboundFlights) {
    for (const inFlight of inboundFlights) {
      if (!outFlight.departure || !outFlight.arrival || !inFlight.departure || !inFlight.arrival) continue;
      const outDate = new Date(outFlight.date);
      const inDate = new Date(inFlight.date);
      const diffTime = inDate - outDate;
      const dateDiff = Math.round(diffTime / (1e3 * 60 * 60 * 24));
      const stayDays = dateDiff + 1;
      const outArrivalTime = /* @__PURE__ */ new Date(`${outFlight.date}T${outFlight.arrival}:00`);
      const inDepartureTime = /* @__PURE__ */ new Date(`${inFlight.date}T${inFlight.departure}:00`);
      const timeDiffMs = inDepartureTime - outArrivalTime;
      const timeDiffHours = timeDiffMs / (1e3 * 60 * 60);
      if (timeDiffHours < 7) {
        rejectedByTime++;
        console.log(`   \u274C ODRZUCONO (czas<7h) [fullScan]: out ${outFlight.date} ${outFlight.arrival} (arr) - in ${inFlight.date} ${inFlight.departure} (dep); diff ${timeDiffHours.toFixed(2)}h; outPrice ${outFlight.priceInPLN}, inPrice ${inFlight.priceInPLN}; origin ${outFlight.origin} -> return ${inFlight.origin}`);
        continue;
      }
      if (stayDays >= stayDaysMin && stayDays <= stayDaysMax) {
        const totalPriceInPLN = (outFlight.priceInPLN || 0) + (inFlight.priceInPLN || 0);
        if (totalPriceInPLN === 0) {
          continue;
        }
        if (maxPrice && totalPriceInPLN > maxPrice) {
          rejectedByCombo++;
          console.log(`   \u274C ODRZUCONO (cena>max) [fullScan]: out ${outFlight.date} ${outFlight.arrival} + in ${inFlight.date} ${inFlight.departure} -> total ${totalPriceInPLN} PLN > ${maxPrice}; origin ${outFlight.origin} -> return ${inFlight.origin}`);
          continue;
        }
        combinations.push({
          outbound: outFlight,
          inbound: inFlight,
          totalPriceInPLN,
          // tylko cena w PLN
          stayDays,
          // używaj stayDays (1=ten sam dzień), nie dateDiff
          outDate: outFlight.date,
          inDate: inFlight.date,
          originAirport: outFlight.origin,
          returnAirport: inFlight.destination,
          originName: outFlight.originName || "",
          returnName: inFlight.destinationName || "",
          source: outFlight.source === "API" && inFlight.source === "API" ? "API" : outFlight.source === "CACHE" && inFlight.source === "CACHE" ? "CACHE" : "MIXED"
        });
        console.log(`   \u2705 Zaakceptowano [fullScan]: ${outFlight.origin}->${outFlight.destination} ${outFlight.date} (${outFlight.arrival}) + ${inFlight.origin}->${inFlight.destination} ${inFlight.date} (${inFlight.departure}) = ${totalPriceInPLN} PLN; legSources: ${outFlight.source || "UNKNOWN"}/${inFlight.source || "UNKNOWN"}; comboSource: ${outFlight.source === "API" && inFlight.source === "API" ? "API" : outFlight.source === "CACHE" && inFlight.source === "CACHE" ? "CACHE" : "MIXED"}`);
        console.log(`   \u2705 Zaakceptowano [fullScan]: ${outFlight.origin}->${outFlight.destination} ${outFlight.date} (${outFlight.arrival}) + ${inFlight.origin}->${inFlight.destination} ${inFlight.date} (${inFlight.departure}) = ${totalPriceInPLN} PLN; source: ${outFlight.source || "UNKNOWN"}/${inFlight.source || "UNKNOWN"}`);
      } else {
        rejectedByStay++;
        console.log(`   \u274C ODRZUCONO (pobyt poza zakresem) [fullScan]: out ${outFlight.date} -> in ${inFlight.date} = ${stayDays} dni; allowed ${stayDaysMin}-${stayDaysMax}; origin ${outFlight.origin}`);
      }
    }
  }
  console.log(`\u{1F4CA} \u0141\u0105czenie: ${outboundFlights.length} TAM \xD7 ${inboundFlights.length} POWR\xD3T = ${outboundFlights.length * inboundFlights.length} mo\u017Cliwo\u015Bci`);
  console.log(`   \u274C Odrzucono: ${rejectedByCombo} (cena > ${maxPrice || "\u221E"}), ${rejectedByTime} (< 7h), ${rejectedByStay} (poza zakresem pobytu)`);
  console.log(`   \u2705 Zaakceptowano: ${combinations.length} kombinacji`);
  combinations.sort((a2, b3) => {
    if (!a2.totalPriceInPLN) return 1;
    if (!b3.totalPriceInPLN) return -1;
    return a2.totalPriceInPLN - b3.totalPriceInPLN;
  });
  let filtered = combinations;
  if (cheapCombinations.size > 0 && METRICS.totalDays === 0) {
    METRICS.totalDays = outCached + outFetched + (inCached + inFetched);
    METRICS.daysFromCache = outCached + inCached;
    METRICS.daysFetched = outFetched + inFetched;
  }
  LAST_METRICS = {
    ...METRICS,
    percentFromCache: METRICS.totalDays > 0 ? Math.round(METRICS.daysFromCache / METRICS.totalDays * 100) : 0,
    percentFromApi: METRICS.totalDays > 0 ? Math.round(METRICS.daysFetched / METRICS.totalDays * 100) : 0
  };
  if (useFareFinderOptimization) {
    const daysSearched = outCached + outFetched + (inCached + inFetched);
    const possibleDaysWithoutOptimization = totalDays * 2;
    const savedDays = possibleDaysWithoutOptimization - daysSearched;
    const savedPercent = possibleDaysWithoutOptimization > 0 ? Math.round(savedDays / possibleDaysWithoutOptimization * 100) : 0;
    console.log(`\u{1F4B0} Oszcz\u0119dno\u015B\u0107 FareFinder: ${savedDays}/${possibleDaysWithoutOptimization} dni (${savedPercent}%) - dzi\u0119ki optymalizacji pomini\u0119to ${savedDays} zapyta\u0144`);
  }
  console.log(`Znaleziono ${filtered.length} kombinacji round-trip. API calls: ${LAST_METRICS.apiCalls} (FareFinder: ${LAST_METRICS.fareFinderCalls}), dni: ${LAST_METRICS.totalDays} (${LAST_METRICS.daysFromCache} cache, ${LAST_METRICS.daysFetched} API)`);
  return filtered;
}
function parseFlights(data, tripIndex = 0) {
  const flights = [];
  if (!data.trips || !data.trips[tripIndex]) {
    return flights;
  }
  const trip = data.trips[tripIndex];
  for (const dateEntry of trip.dates || []) {
    for (const flight of dateEntry.flights || []) {
      if (!flight.time || flight.time.length < 2) continue;
      const departureTime = flight.time[0];
      const arrivalTime = flight.time[1];
      const flightInfo = {
        date: departureTime.substring(0, 10),
        // "2025-12-01"
        flightNumber: flight.flightNumber || "",
        departure: departureTime.substring(11, 16),
        // "08:30"
        arrival: arrivalTime.substring(11, 16),
        // "09:50"
        duration: flight.duration || "",
        price: null,
        currency: data.currency || "PLN",
        priceInPLN: null,
        // Będzie wyliczone poniżej
        source: "API",
        // default when parsing actual API search results
        faresLeft: flight.faresLeft || 0,
        infantsLeft: flight.infantsLeft || 0,
        operatedBy: flight.operatedBy || "Ryanair"
      };
      if (flight.regularFare && flight.regularFare.fares && flight.regularFare.fares.length > 0) {
        flightInfo.price = flight.regularFare.fares[0].amount;
        const convertedPrice = convertToPLN(flightInfo.price, flightInfo.currency);
        flightInfo.priceInPLN = convertedPrice !== null ? convertedPrice : flightInfo.price || 0;
      } else if (flight.price && typeof flight.price === "number") {
        flightInfo.price = flight.price;
        flightInfo.priceInPLN = convertToPLN(flightInfo.price, flightInfo.currency) || flightInfo.price;
      } else {
        flightInfo.price = 0;
        flightInfo.priceInPLN = 0;
      }
      flights.push(flightInfo);
    }
  }
  return flights;
}
async function getAvailableDates(origin2, destination, market = "pl-pl") {
  try {
    await smartDelay();
    const response = await safeRyanairFetch(
      `${BACKEND_API}/ryanair/availableDates?origin=${origin2}&destination=${destination}&market=${market}`,
      {
        method: "GET",
        headers: {
          "Accept": "application/json"
        }
      }
    );
    if (!response.ok) {
      console.warn(`\u26A0\uFE0F Nie uda\u0142o si\u0119 pobra\u0107 dost\u0119pnych dat dla ${origin2}\u2192${destination}, status ${response.status}`);
      return null;
    }
    const data = await response.json();
    if (data.error) {
      console.warn(`\u26A0\uFE0F B\u0142\u0105d dost\u0119pno\u015Bci dat ${origin2}\u2192${destination}: ${data.error}`);
      return null;
    }
    console.log(`\u{1F4C5} Dost\u0119pne daty ${origin2}\u2192${destination}: ${data.count} dni${data.cached ? " (cache)" : ""}`);
    return data.dates || [];
  } catch (error) {
    console.error(`\u274C B\u0142\u0105d pobierania dost\u0119pnych dat ${origin2}\u2192${destination}:`, error);
    if (error?.hardBlocked) throw error;
    return null;
  }
}
async function searchAnyDestination(params, priceLimit = null) {
  const { origin: origin2, dateFrom, dateTo, adults = 1, market = "pl-pl", departureFrom = "00:00", departureTo = "23:59" } = params;
  console.log("\u{1F50D} searchAnyDestination wywo\u0142ane:", params);
  try {
    const cacheKey = `any:${origin2}:${dateFrom}:${dateTo}:${adults}:${market}:${priceLimit ?? "null"}`;
    if (globalThis.__anyDestCache && globalThis.__anyDestCache.has(cacheKey)) {
      const entry = globalThis.__anyDestCache.get(cacheKey);
      if (entry.expires > Date.now()) {
        if (entry.result) {
          console.log("\u{1F4BE} searchAnyDestination cache hit:", cacheKey);
          if (entry.result.fares && Array.isArray(entry.result.fares)) {
            entry.result.fares = entry.result.fares.map((far) => ({
              ...far,
              flights: Array.isArray(far.flights) ? far.flights.map((x2) => ({ ...x2, source: x2.source || "CACHE" })) : far.flights
            }));
          }
          return entry.result;
        }
      } else {
        globalThis.__anyDestCache.delete(cacheKey);
      }
    }
    const queryParams = new URLSearchParams({
      departureAirportIataCode: origin2,
      outboundDepartureDateFrom: dateFrom,
      outboundDepartureDateTo: dateTo,
      outboundDepartureTimeFrom: departureFrom,
      outboundDepartureTimeTo: departureTo,
      adultPaxCount: adults,
      market,
      searchMode: "ALL"
    });
    if (priceLimit) queryParams.set("maxPrice", String(priceLimit));
    await smartDelay();
    console.log("\u{1F4E1} Wysy\u0142am zapytanie do backend:", `${BACKEND_API}/ryanair/anyDestination?${queryParams}`);
    const response = await safeRyanairFetch(
      `${BACKEND_API}/ryanair/anyDestination?${queryParams}`,
      {
        method: "GET",
        headers: {
          "Accept": "application/json"
        }
      }
    );
    if (!response.ok) {
      throw new Error(`B\u0142\u0105d API: ${response.status}`);
    }
    const data = await response.json();
    console.log("\u{1F4E6} Otrzymane dane z backend:", data);
    const destinations = {};
    if (data.fares && Array.isArray(data.fares)) {
      console.log("\u{1F50D} Parsuj\u0119", data.fares.length, "fare'\xF3w");
      data.fares.forEach((fare, index) => {
        console.log(`Fare ${index}:`, JSON.stringify(fare).substring(0, 200));
        const dest = fare.outbound?.arrivalAirport?.iataCode;
        const rawPriceObj = fare.outbound?.price;
        const price = (rawPriceObj?.value ?? rawPriceObj?.amount) || 0;
        const date = fare.outbound?.departureDate?.split("T")[0];
        console.log(`  Dest: ${dest}, Price: ${price}, Date: ${date}`);
        if (dest && price > 0) {
          if (!destinations[dest]) {
            destinations[dest] = {
              destination: dest,
              destinationName: fare.outbound?.arrivalAirport?.name || dest,
              minPrice: convertToPLN(price, rawPriceObj?.currencyCode || rawPriceObj?.currency || "PLN") || price,
              flights: []
            };
          }
          destinations[dest].minPrice = Math.min(destinations[dest].minPrice, convertToPLN(price, rawPriceObj?.currencyCode || rawPriceObj?.currency || "PLN") || price);
          const currency = rawPriceObj?.currencyCode || rawPriceObj?.currency || "PLN";
          const flightObj = {
            date,
            price,
            currency,
            priceInPLN: convertToPLN(price, currency),
            originAirport: origin2,
            source: fare.source || "API",
            departure: fare.outbound?.departureTime?.split("T")?.[1]?.slice(0, 5) || fare.outbound?.time || null,
            arrival: fare.outbound?.arrivalTime?.split("T")?.[1]?.slice(0, 5) || null
          };
          if (departureFrom || departureTo) {
            if (isTimeBetween(flightObj.departure, departureFrom, departureTo)) {
              destinations[dest].flights.push(flightObj);
            }
          } else {
            destinations[dest].flights.push(flightObj);
          }
        } else {
          console.log(`  \u26A0\uFE0F Pomin\u0119to fare - dest: ${dest}, price: ${price}`);
        }
      });
    } else {
      console.log("\u26A0\uFE0F Brak fares w odpowiedzi:", data);
    }
    const result = Object.values(destinations);
    try {
      if (!globalThis.__anyDestCache) globalThis.__anyDestCache = /* @__PURE__ */ new Map();
      globalThis.__anyDestCache.set(cacheKey, { result, expires: Date.now() + 30 * 60 * 1e3 });
    } catch (e2) {
    }
    console.log("\u2705 searchAnyDestination zwraca:", result.length, "destynacji");
    return result;
  } catch (error) {
    console.error("B\u0142\u0105d wyszukiwania ANY destination:", error);
    if (error?.hardBlocked) throw error;
    return [];
  }
}

// node_modules/axios/lib/helpers/bind.js
function bind(fn, thisArg) {
  return function wrap() {
    return fn.apply(thisArg, arguments);
  };
}

// node_modules/axios/lib/utils.js
var { toString } = Object.prototype;
var { getPrototypeOf } = Object;
var { iterator, toStringTag } = Symbol;
var kindOf = /* @__PURE__ */ ((cache) => (thing) => {
  const str = toString.call(thing);
  return cache[str] || (cache[str] = str.slice(8, -1).toLowerCase());
})(/* @__PURE__ */ Object.create(null));
var kindOfTest = (type) => {
  type = type.toLowerCase();
  return (thing) => kindOf(thing) === type;
};
var typeOfTest = (type) => (thing) => typeof thing === type;
var { isArray } = Array;
var isUndefined = typeOfTest("undefined");
function isBuffer(val) {
  return val !== null && !isUndefined(val) && val.constructor !== null && !isUndefined(val.constructor) && isFunction(val.constructor.isBuffer) && val.constructor.isBuffer(val);
}
var isArrayBuffer = kindOfTest("ArrayBuffer");
function isArrayBufferView(val) {
  let result;
  if (typeof ArrayBuffer !== "undefined" && ArrayBuffer.isView) {
    result = ArrayBuffer.isView(val);
  } else {
    result = val && val.buffer && isArrayBuffer(val.buffer);
  }
  return result;
}
var isString = typeOfTest("string");
var isFunction = typeOfTest("function");
var isNumber = typeOfTest("number");
var isObject = (thing) => thing !== null && typeof thing === "object";
var isBoolean = (thing) => thing === true || thing === false;
var isPlainObject = (val) => {
  if (kindOf(val) !== "object") {
    return false;
  }
  const prototype3 = getPrototypeOf(val);
  return (prototype3 === null || prototype3 === Object.prototype || Object.getPrototypeOf(prototype3) === null) && !(toStringTag in val) && !(iterator in val);
};
var isEmptyObject = (val) => {
  if (!isObject(val) || isBuffer(val)) {
    return false;
  }
  try {
    return Object.keys(val).length === 0 && Object.getPrototypeOf(val) === Object.prototype;
  } catch (e2) {
    return false;
  }
};
var isDate = kindOfTest("Date");
var isFile = kindOfTest("File");
var isBlob = kindOfTest("Blob");
var isFileList = kindOfTest("FileList");
var isStream = (val) => isObject(val) && isFunction(val.pipe);
var isFormData = (thing) => {
  let kind;
  return thing && (typeof FormData === "function" && thing instanceof FormData || isFunction(thing.append) && ((kind = kindOf(thing)) === "formdata" || // detect form-data instance
  kind === "object" && isFunction(thing.toString) && thing.toString() === "[object FormData]"));
};
var isURLSearchParams = kindOfTest("URLSearchParams");
var [isReadableStream, isRequest, isResponse, isHeaders] = ["ReadableStream", "Request", "Response", "Headers"].map(kindOfTest);
var trim = (str) => str.trim ? str.trim() : str.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, "");
function forEach(obj, fn, { allOwnKeys = false } = {}) {
  if (obj === null || typeof obj === "undefined") {
    return;
  }
  let i2;
  let l2;
  if (typeof obj !== "object") {
    obj = [obj];
  }
  if (isArray(obj)) {
    for (i2 = 0, l2 = obj.length; i2 < l2; i2++) {
      fn.call(null, obj[i2], i2, obj);
    }
  } else {
    if (isBuffer(obj)) {
      return;
    }
    const keys = allOwnKeys ? Object.getOwnPropertyNames(obj) : Object.keys(obj);
    const len = keys.length;
    let key;
    for (i2 = 0; i2 < len; i2++) {
      key = keys[i2];
      fn.call(null, obj[key], key, obj);
    }
  }
}
function findKey(obj, key) {
  if (isBuffer(obj)) {
    return null;
  }
  key = key.toLowerCase();
  const keys = Object.keys(obj);
  let i2 = keys.length;
  let _key;
  while (i2-- > 0) {
    _key = keys[i2];
    if (key === _key.toLowerCase()) {
      return _key;
    }
  }
  return null;
}
var _global = (() => {
  if (typeof globalThis !== "undefined") return globalThis;
  return typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : global;
})();
var isContextDefined = (context) => !isUndefined(context) && context !== _global;
function merge() {
  const { caseless, skipUndefined } = isContextDefined(this) && this || {};
  const result = {};
  const assignValue = (val, key) => {
    const targetKey = caseless && findKey(result, key) || key;
    if (isPlainObject(result[targetKey]) && isPlainObject(val)) {
      result[targetKey] = merge(result[targetKey], val);
    } else if (isPlainObject(val)) {
      result[targetKey] = merge({}, val);
    } else if (isArray(val)) {
      result[targetKey] = val.slice();
    } else if (!skipUndefined || !isUndefined(val)) {
      result[targetKey] = val;
    }
  };
  for (let i2 = 0, l2 = arguments.length; i2 < l2; i2++) {
    arguments[i2] && forEach(arguments[i2], assignValue);
  }
  return result;
}
var extend = (a2, b3, thisArg, { allOwnKeys } = {}) => {
  forEach(b3, (val, key) => {
    if (thisArg && isFunction(val)) {
      a2[key] = bind(val, thisArg);
    } else {
      a2[key] = val;
    }
  }, { allOwnKeys });
  return a2;
};
var stripBOM = (content) => {
  if (content.charCodeAt(0) === 65279) {
    content = content.slice(1);
  }
  return content;
};
var inherits = (constructor, superConstructor, props, descriptors2) => {
  constructor.prototype = Object.create(superConstructor.prototype, descriptors2);
  constructor.prototype.constructor = constructor;
  Object.defineProperty(constructor, "super", {
    value: superConstructor.prototype
  });
  props && Object.assign(constructor.prototype, props);
};
var toFlatObject = (sourceObj, destObj, filter2, propFilter) => {
  let props;
  let i2;
  let prop;
  const merged = {};
  destObj = destObj || {};
  if (sourceObj == null) return destObj;
  do {
    props = Object.getOwnPropertyNames(sourceObj);
    i2 = props.length;
    while (i2-- > 0) {
      prop = props[i2];
      if ((!propFilter || propFilter(prop, sourceObj, destObj)) && !merged[prop]) {
        destObj[prop] = sourceObj[prop];
        merged[prop] = true;
      }
    }
    sourceObj = filter2 !== false && getPrototypeOf(sourceObj);
  } while (sourceObj && (!filter2 || filter2(sourceObj, destObj)) && sourceObj !== Object.prototype);
  return destObj;
};
var endsWith = (str, searchString, position) => {
  str = String(str);
  if (position === void 0 || position > str.length) {
    position = str.length;
  }
  position -= searchString.length;
  const lastIndex = str.indexOf(searchString, position);
  return lastIndex !== -1 && lastIndex === position;
};
var toArray = (thing) => {
  if (!thing) return null;
  if (isArray(thing)) return thing;
  let i2 = thing.length;
  if (!isNumber(i2)) return null;
  const arr = new Array(i2);
  while (i2-- > 0) {
    arr[i2] = thing[i2];
  }
  return arr;
};
var isTypedArray = /* @__PURE__ */ ((TypedArray) => {
  return (thing) => {
    return TypedArray && thing instanceof TypedArray;
  };
})(typeof Uint8Array !== "undefined" && getPrototypeOf(Uint8Array));
var forEachEntry = (obj, fn) => {
  const generator = obj && obj[iterator];
  const _iterator = generator.call(obj);
  let result;
  while ((result = _iterator.next()) && !result.done) {
    const pair = result.value;
    fn.call(obj, pair[0], pair[1]);
  }
};
var matchAll = (regExp, str) => {
  let matches;
  const arr = [];
  while ((matches = regExp.exec(str)) !== null) {
    arr.push(matches);
  }
  return arr;
};
var isHTMLForm = kindOfTest("HTMLFormElement");
var toCamelCase = (str) => {
  return str.toLowerCase().replace(
    /[-_\s]([a-z\d])(\w*)/g,
    function replacer(m2, p1, p2) {
      return p1.toUpperCase() + p2;
    }
  );
};
var hasOwnProperty = (({ hasOwnProperty: hasOwnProperty2 }) => (obj, prop) => hasOwnProperty2.call(obj, prop))(Object.prototype);
var isRegExp = kindOfTest("RegExp");
var reduceDescriptors = (obj, reducer) => {
  const descriptors2 = Object.getOwnPropertyDescriptors(obj);
  const reducedDescriptors = {};
  forEach(descriptors2, (descriptor, name) => {
    let ret;
    if ((ret = reducer(descriptor, name, obj)) !== false) {
      reducedDescriptors[name] = ret || descriptor;
    }
  });
  Object.defineProperties(obj, reducedDescriptors);
};
var freezeMethods = (obj) => {
  reduceDescriptors(obj, (descriptor, name) => {
    if (isFunction(obj) && ["arguments", "caller", "callee"].indexOf(name) !== -1) {
      return false;
    }
    const value = obj[name];
    if (!isFunction(value)) return;
    descriptor.enumerable = false;
    if ("writable" in descriptor) {
      descriptor.writable = false;
      return;
    }
    if (!descriptor.set) {
      descriptor.set = () => {
        throw Error("Can not rewrite read-only method '" + name + "'");
      };
    }
  });
};
var toObjectSet = (arrayOrString, delimiter) => {
  const obj = {};
  const define = (arr) => {
    arr.forEach((value) => {
      obj[value] = true;
    });
  };
  isArray(arrayOrString) ? define(arrayOrString) : define(String(arrayOrString).split(delimiter));
  return obj;
};
var noop = () => {
};
var toFiniteNumber = (value, defaultValue) => {
  return value != null && Number.isFinite(value = +value) ? value : defaultValue;
};
function isSpecCompliantForm(thing) {
  return !!(thing && isFunction(thing.append) && thing[toStringTag] === "FormData" && thing[iterator]);
}
var toJSONObject = (obj) => {
  const stack = new Array(10);
  const visit = (source, i2) => {
    if (isObject(source)) {
      if (stack.indexOf(source) >= 0) {
        return;
      }
      if (isBuffer(source)) {
        return source;
      }
      if (!("toJSON" in source)) {
        stack[i2] = source;
        const target = isArray(source) ? [] : {};
        forEach(source, (value, key) => {
          const reducedValue = visit(value, i2 + 1);
          !isUndefined(reducedValue) && (target[key] = reducedValue);
        });
        stack[i2] = void 0;
        return target;
      }
    }
    return source;
  };
  return visit(obj, 0);
};
var isAsyncFn = kindOfTest("AsyncFunction");
var isThenable = (thing) => thing && (isObject(thing) || isFunction(thing)) && isFunction(thing.then) && isFunction(thing.catch);
var _setImmediate = ((setImmediateSupported, postMessageSupported) => {
  if (setImmediateSupported) {
    return setImmediate;
  }
  return postMessageSupported ? ((token, callbacks) => {
    _global.addEventListener("message", ({ source, data }) => {
      if (source === _global && data === token) {
        callbacks.length && callbacks.shift()();
      }
    }, false);
    return (cb) => {
      callbacks.push(cb);
      _global.postMessage(token, "*");
    };
  })(`axios@${Math.random()}`, []) : (cb) => setTimeout(cb);
})(
  typeof setImmediate === "function",
  isFunction(_global.postMessage)
);
var asap = typeof queueMicrotask !== "undefined" ? queueMicrotask.bind(_global) : typeof process !== "undefined" && process.nextTick || _setImmediate;
var isIterable = (thing) => thing != null && isFunction(thing[iterator]);
var utils_default = {
  isArray,
  isArrayBuffer,
  isBuffer,
  isFormData,
  isArrayBufferView,
  isString,
  isNumber,
  isBoolean,
  isObject,
  isPlainObject,
  isEmptyObject,
  isReadableStream,
  isRequest,
  isResponse,
  isHeaders,
  isUndefined,
  isDate,
  isFile,
  isBlob,
  isRegExp,
  isFunction,
  isStream,
  isURLSearchParams,
  isTypedArray,
  isFileList,
  forEach,
  merge,
  extend,
  trim,
  stripBOM,
  inherits,
  toFlatObject,
  kindOf,
  kindOfTest,
  endsWith,
  toArray,
  forEachEntry,
  matchAll,
  isHTMLForm,
  hasOwnProperty,
  hasOwnProp: hasOwnProperty,
  // an alias to avoid ESLint no-prototype-builtins detection
  reduceDescriptors,
  freezeMethods,
  toObjectSet,
  toCamelCase,
  noop,
  toFiniteNumber,
  findKey,
  global: _global,
  isContextDefined,
  isSpecCompliantForm,
  toJSONObject,
  isAsyncFn,
  isThenable,
  setImmediate: _setImmediate,
  asap,
  isIterable
};

// node_modules/axios/lib/core/AxiosError.js
function AxiosError(message, code, config, request, response) {
  Error.call(this);
  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, this.constructor);
  } else {
    this.stack = new Error().stack;
  }
  this.message = message;
  this.name = "AxiosError";
  code && (this.code = code);
  config && (this.config = config);
  request && (this.request = request);
  if (response) {
    this.response = response;
    this.status = response.status ? response.status : null;
  }
}
utils_default.inherits(AxiosError, Error, {
  toJSON: function toJSON() {
    return {
      // Standard
      message: this.message,
      name: this.name,
      // Microsoft
      description: this.description,
      number: this.number,
      // Mozilla
      fileName: this.fileName,
      lineNumber: this.lineNumber,
      columnNumber: this.columnNumber,
      stack: this.stack,
      // Axios
      config: utils_default.toJSONObject(this.config),
      code: this.code,
      status: this.status
    };
  }
});
var prototype = AxiosError.prototype;
var descriptors = {};
[
  "ERR_BAD_OPTION_VALUE",
  "ERR_BAD_OPTION",
  "ECONNABORTED",
  "ETIMEDOUT",
  "ERR_NETWORK",
  "ERR_FR_TOO_MANY_REDIRECTS",
  "ERR_DEPRECATED",
  "ERR_BAD_RESPONSE",
  "ERR_BAD_REQUEST",
  "ERR_CANCELED",
  "ERR_NOT_SUPPORT",
  "ERR_INVALID_URL"
  // eslint-disable-next-line func-names
].forEach((code) => {
  descriptors[code] = { value: code };
});
Object.defineProperties(AxiosError, descriptors);
Object.defineProperty(prototype, "isAxiosError", { value: true });
AxiosError.from = (error, code, config, request, response, customProps) => {
  const axiosError = Object.create(prototype);
  utils_default.toFlatObject(error, axiosError, function filter2(obj) {
    return obj !== Error.prototype;
  }, (prop) => {
    return prop !== "isAxiosError";
  });
  const msg = error && error.message ? error.message : "Error";
  const errCode = code == null && error ? error.code : code;
  AxiosError.call(axiosError, msg, errCode, config, request, response);
  if (error && axiosError.cause == null) {
    Object.defineProperty(axiosError, "cause", { value: error, configurable: true });
  }
  axiosError.name = error && error.name || "Error";
  customProps && Object.assign(axiosError, customProps);
  return axiosError;
};
var AxiosError_default = AxiosError;

// node_modules/axios/lib/helpers/null.js
var null_default = null;

// node_modules/axios/lib/helpers/toFormData.js
function isVisitable(thing) {
  return utils_default.isPlainObject(thing) || utils_default.isArray(thing);
}
function removeBrackets(key) {
  return utils_default.endsWith(key, "[]") ? key.slice(0, -2) : key;
}
function renderKey(path, key, dots) {
  if (!path) return key;
  return path.concat(key).map(function each(token, i2) {
    token = removeBrackets(token);
    return !dots && i2 ? "[" + token + "]" : token;
  }).join(dots ? "." : "");
}
function isFlatArray(arr) {
  return utils_default.isArray(arr) && !arr.some(isVisitable);
}
var predicates = utils_default.toFlatObject(utils_default, {}, null, function filter(prop) {
  return /^is[A-Z]/.test(prop);
});
function toFormData(obj, formData, options) {
  if (!utils_default.isObject(obj)) {
    throw new TypeError("target must be an object");
  }
  formData = formData || new (null_default || FormData)();
  options = utils_default.toFlatObject(options, {
    metaTokens: true,
    dots: false,
    indexes: false
  }, false, function defined(option, source) {
    return !utils_default.isUndefined(source[option]);
  });
  const metaTokens = options.metaTokens;
  const visitor = options.visitor || defaultVisitor;
  const dots = options.dots;
  const indexes = options.indexes;
  const _Blob = options.Blob || typeof Blob !== "undefined" && Blob;
  const useBlob = _Blob && utils_default.isSpecCompliantForm(formData);
  if (!utils_default.isFunction(visitor)) {
    throw new TypeError("visitor must be a function");
  }
  function convertValue(value) {
    if (value === null) return "";
    if (utils_default.isDate(value)) {
      return value.toISOString();
    }
    if (utils_default.isBoolean(value)) {
      return value.toString();
    }
    if (!useBlob && utils_default.isBlob(value)) {
      throw new AxiosError_default("Blob is not supported. Use a Buffer instead.");
    }
    if (utils_default.isArrayBuffer(value) || utils_default.isTypedArray(value)) {
      return useBlob && typeof Blob === "function" ? new Blob([value]) : Buffer.from(value);
    }
    return value;
  }
  function defaultVisitor(value, key, path) {
    let arr = value;
    if (value && !path && typeof value === "object") {
      if (utils_default.endsWith(key, "{}")) {
        key = metaTokens ? key : key.slice(0, -2);
        value = JSON.stringify(value);
      } else if (utils_default.isArray(value) && isFlatArray(value) || (utils_default.isFileList(value) || utils_default.endsWith(key, "[]")) && (arr = utils_default.toArray(value))) {
        key = removeBrackets(key);
        arr.forEach(function each(el, index) {
          !(utils_default.isUndefined(el) || el === null) && formData.append(
            // eslint-disable-next-line no-nested-ternary
            indexes === true ? renderKey([key], index, dots) : indexes === null ? key : key + "[]",
            convertValue(el)
          );
        });
        return false;
      }
    }
    if (isVisitable(value)) {
      return true;
    }
    formData.append(renderKey(path, key, dots), convertValue(value));
    return false;
  }
  const stack = [];
  const exposedHelpers = Object.assign(predicates, {
    defaultVisitor,
    convertValue,
    isVisitable
  });
  function build(value, path) {
    if (utils_default.isUndefined(value)) return;
    if (stack.indexOf(value) !== -1) {
      throw Error("Circular reference detected in " + path.join("."));
    }
    stack.push(value);
    utils_default.forEach(value, function each(el, key) {
      const result = !(utils_default.isUndefined(el) || el === null) && visitor.call(
        formData,
        el,
        utils_default.isString(key) ? key.trim() : key,
        path,
        exposedHelpers
      );
      if (result === true) {
        build(el, path ? path.concat(key) : [key]);
      }
    });
    stack.pop();
  }
  if (!utils_default.isObject(obj)) {
    throw new TypeError("data must be an object");
  }
  build(obj);
  return formData;
}
var toFormData_default = toFormData;

// node_modules/axios/lib/helpers/AxiosURLSearchParams.js
function encode(str) {
  const charMap = {
    "!": "%21",
    "'": "%27",
    "(": "%28",
    ")": "%29",
    "~": "%7E",
    "%20": "+",
    "%00": "\0"
  };
  return encodeURIComponent(str).replace(/[!'()~]|%20|%00/g, function replacer(match) {
    return charMap[match];
  });
}
function AxiosURLSearchParams(params, options) {
  this._pairs = [];
  params && toFormData_default(params, this, options);
}
var prototype2 = AxiosURLSearchParams.prototype;
prototype2.append = function append(name, value) {
  this._pairs.push([name, value]);
};
prototype2.toString = function toString2(encoder) {
  const _encode = encoder ? function(value) {
    return encoder.call(this, value, encode);
  } : encode;
  return this._pairs.map(function each(pair) {
    return _encode(pair[0]) + "=" + _encode(pair[1]);
  }, "").join("&");
};
var AxiosURLSearchParams_default = AxiosURLSearchParams;

// node_modules/axios/lib/helpers/buildURL.js
function encode2(val) {
  return encodeURIComponent(val).replace(/%3A/gi, ":").replace(/%24/g, "$").replace(/%2C/gi, ",").replace(/%20/g, "+");
}
function buildURL(url, params, options) {
  if (!params) {
    return url;
  }
  const _encode = options && options.encode || encode2;
  if (utils_default.isFunction(options)) {
    options = {
      serialize: options
    };
  }
  const serializeFn = options && options.serialize;
  let serializedParams;
  if (serializeFn) {
    serializedParams = serializeFn(params, options);
  } else {
    serializedParams = utils_default.isURLSearchParams(params) ? params.toString() : new AxiosURLSearchParams_default(params, options).toString(_encode);
  }
  if (serializedParams) {
    const hashmarkIndex = url.indexOf("#");
    if (hashmarkIndex !== -1) {
      url = url.slice(0, hashmarkIndex);
    }
    url += (url.indexOf("?") === -1 ? "?" : "&") + serializedParams;
  }
  return url;
}

// node_modules/axios/lib/core/InterceptorManager.js
var InterceptorManager = class {
  constructor() {
    this.handlers = [];
  }
  /**
   * Add a new interceptor to the stack
   *
   * @param {Function} fulfilled The function to handle `then` for a `Promise`
   * @param {Function} rejected The function to handle `reject` for a `Promise`
   *
   * @return {Number} An ID used to remove interceptor later
   */
  use(fulfilled, rejected, options) {
    this.handlers.push({
      fulfilled,
      rejected,
      synchronous: options ? options.synchronous : false,
      runWhen: options ? options.runWhen : null
    });
    return this.handlers.length - 1;
  }
  /**
   * Remove an interceptor from the stack
   *
   * @param {Number} id The ID that was returned by `use`
   *
   * @returns {void}
   */
  eject(id) {
    if (this.handlers[id]) {
      this.handlers[id] = null;
    }
  }
  /**
   * Clear all interceptors from the stack
   *
   * @returns {void}
   */
  clear() {
    if (this.handlers) {
      this.handlers = [];
    }
  }
  /**
   * Iterate over all the registered interceptors
   *
   * This method is particularly useful for skipping over any
   * interceptors that may have become `null` calling `eject`.
   *
   * @param {Function} fn The function to call for each interceptor
   *
   * @returns {void}
   */
  forEach(fn) {
    utils_default.forEach(this.handlers, function forEachHandler(h3) {
      if (h3 !== null) {
        fn(h3);
      }
    });
  }
};
var InterceptorManager_default = InterceptorManager;

// node_modules/axios/lib/defaults/transitional.js
var transitional_default = {
  silentJSONParsing: true,
  forcedJSONParsing: true,
  clarifyTimeoutError: false
};

// node_modules/axios/lib/platform/browser/classes/URLSearchParams.js
var URLSearchParams_default = typeof URLSearchParams !== "undefined" ? URLSearchParams : AxiosURLSearchParams_default;

// node_modules/axios/lib/platform/browser/classes/FormData.js
var FormData_default = typeof FormData !== "undefined" ? FormData : null;

// node_modules/axios/lib/platform/browser/classes/Blob.js
var Blob_default = typeof Blob !== "undefined" ? Blob : null;

// node_modules/axios/lib/platform/browser/index.js
var browser_default = {
  isBrowser: true,
  classes: {
    URLSearchParams: URLSearchParams_default,
    FormData: FormData_default,
    Blob: Blob_default
  },
  protocols: ["http", "https", "file", "blob", "url", "data"]
};

// node_modules/axios/lib/platform/common/utils.js
var utils_exports = {};
__export(utils_exports, {
  hasBrowserEnv: () => hasBrowserEnv,
  hasStandardBrowserEnv: () => hasStandardBrowserEnv,
  hasStandardBrowserWebWorkerEnv: () => hasStandardBrowserWebWorkerEnv,
  navigator: () => _navigator,
  origin: () => origin
});
var hasBrowserEnv = typeof window !== "undefined" && typeof document !== "undefined";
var _navigator = typeof navigator === "object" && navigator || void 0;
var hasStandardBrowserEnv = hasBrowserEnv && (!_navigator || ["ReactNative", "NativeScript", "NS"].indexOf(_navigator.product) < 0);
var hasStandardBrowserWebWorkerEnv = (() => {
  return typeof WorkerGlobalScope !== "undefined" && // eslint-disable-next-line no-undef
  self instanceof WorkerGlobalScope && typeof self.importScripts === "function";
})();
var origin = hasBrowserEnv && window.location.href || "http://localhost";

// node_modules/axios/lib/platform/index.js
var platform_default = {
  ...utils_exports,
  ...browser_default
};

// node_modules/axios/lib/helpers/toURLEncodedForm.js
function toURLEncodedForm(data, options) {
  return toFormData_default(data, new platform_default.classes.URLSearchParams(), {
    visitor: function(value, key, path, helpers) {
      if (platform_default.isNode && utils_default.isBuffer(value)) {
        this.append(key, value.toString("base64"));
        return false;
      }
      return helpers.defaultVisitor.apply(this, arguments);
    },
    ...options
  });
}

// node_modules/axios/lib/helpers/formDataToJSON.js
function parsePropPath(name) {
  return utils_default.matchAll(/\w+|\[(\w*)]/g, name).map((match) => {
    return match[0] === "[]" ? "" : match[1] || match[0];
  });
}
function arrayToObject(arr) {
  const obj = {};
  const keys = Object.keys(arr);
  let i2;
  const len = keys.length;
  let key;
  for (i2 = 0; i2 < len; i2++) {
    key = keys[i2];
    obj[key] = arr[key];
  }
  return obj;
}
function formDataToJSON(formData) {
  function buildPath(path, value, target, index) {
    let name = path[index++];
    if (name === "__proto__") return true;
    const isNumericKey = Number.isFinite(+name);
    const isLast = index >= path.length;
    name = !name && utils_default.isArray(target) ? target.length : name;
    if (isLast) {
      if (utils_default.hasOwnProp(target, name)) {
        target[name] = [target[name], value];
      } else {
        target[name] = value;
      }
      return !isNumericKey;
    }
    if (!target[name] || !utils_default.isObject(target[name])) {
      target[name] = [];
    }
    const result = buildPath(path, value, target[name], index);
    if (result && utils_default.isArray(target[name])) {
      target[name] = arrayToObject(target[name]);
    }
    return !isNumericKey;
  }
  if (utils_default.isFormData(formData) && utils_default.isFunction(formData.entries)) {
    const obj = {};
    utils_default.forEachEntry(formData, (name, value) => {
      buildPath(parsePropPath(name), value, obj, 0);
    });
    return obj;
  }
  return null;
}
var formDataToJSON_default = formDataToJSON;

// node_modules/axios/lib/defaults/index.js
function stringifySafely(rawValue, parser, encoder) {
  if (utils_default.isString(rawValue)) {
    try {
      (parser || JSON.parse)(rawValue);
      return utils_default.trim(rawValue);
    } catch (e2) {
      if (e2.name !== "SyntaxError") {
        throw e2;
      }
    }
  }
  return (encoder || JSON.stringify)(rawValue);
}
var defaults = {
  transitional: transitional_default,
  adapter: ["xhr", "http", "fetch"],
  transformRequest: [function transformRequest(data, headers) {
    const contentType = headers.getContentType() || "";
    const hasJSONContentType = contentType.indexOf("application/json") > -1;
    const isObjectPayload = utils_default.isObject(data);
    if (isObjectPayload && utils_default.isHTMLForm(data)) {
      data = new FormData(data);
    }
    const isFormData2 = utils_default.isFormData(data);
    if (isFormData2) {
      return hasJSONContentType ? JSON.stringify(formDataToJSON_default(data)) : data;
    }
    if (utils_default.isArrayBuffer(data) || utils_default.isBuffer(data) || utils_default.isStream(data) || utils_default.isFile(data) || utils_default.isBlob(data) || utils_default.isReadableStream(data)) {
      return data;
    }
    if (utils_default.isArrayBufferView(data)) {
      return data.buffer;
    }
    if (utils_default.isURLSearchParams(data)) {
      headers.setContentType("application/x-www-form-urlencoded;charset=utf-8", false);
      return data.toString();
    }
    let isFileList2;
    if (isObjectPayload) {
      if (contentType.indexOf("application/x-www-form-urlencoded") > -1) {
        return toURLEncodedForm(data, this.formSerializer).toString();
      }
      if ((isFileList2 = utils_default.isFileList(data)) || contentType.indexOf("multipart/form-data") > -1) {
        const _FormData = this.env && this.env.FormData;
        return toFormData_default(
          isFileList2 ? { "files[]": data } : data,
          _FormData && new _FormData(),
          this.formSerializer
        );
      }
    }
    if (isObjectPayload || hasJSONContentType) {
      headers.setContentType("application/json", false);
      return stringifySafely(data);
    }
    return data;
  }],
  transformResponse: [function transformResponse(data) {
    const transitional2 = this.transitional || defaults.transitional;
    const forcedJSONParsing = transitional2 && transitional2.forcedJSONParsing;
    const JSONRequested = this.responseType === "json";
    if (utils_default.isResponse(data) || utils_default.isReadableStream(data)) {
      return data;
    }
    if (data && utils_default.isString(data) && (forcedJSONParsing && !this.responseType || JSONRequested)) {
      const silentJSONParsing = transitional2 && transitional2.silentJSONParsing;
      const strictJSONParsing = !silentJSONParsing && JSONRequested;
      try {
        return JSON.parse(data, this.parseReviver);
      } catch (e2) {
        if (strictJSONParsing) {
          if (e2.name === "SyntaxError") {
            throw AxiosError_default.from(e2, AxiosError_default.ERR_BAD_RESPONSE, this, null, this.response);
          }
          throw e2;
        }
      }
    }
    return data;
  }],
  /**
   * A timeout in milliseconds to abort a request. If set to 0 (default) a
   * timeout is not created.
   */
  timeout: 0,
  xsrfCookieName: "XSRF-TOKEN",
  xsrfHeaderName: "X-XSRF-TOKEN",
  maxContentLength: -1,
  maxBodyLength: -1,
  env: {
    FormData: platform_default.classes.FormData,
    Blob: platform_default.classes.Blob
  },
  validateStatus: function validateStatus(status) {
    return status >= 200 && status < 300;
  },
  headers: {
    common: {
      "Accept": "application/json, text/plain, */*",
      "Content-Type": void 0
    }
  }
};
utils_default.forEach(["delete", "get", "head", "post", "put", "patch"], (method) => {
  defaults.headers[method] = {};
});
var defaults_default = defaults;

// node_modules/axios/lib/helpers/parseHeaders.js
var ignoreDuplicateOf = utils_default.toObjectSet([
  "age",
  "authorization",
  "content-length",
  "content-type",
  "etag",
  "expires",
  "from",
  "host",
  "if-modified-since",
  "if-unmodified-since",
  "last-modified",
  "location",
  "max-forwards",
  "proxy-authorization",
  "referer",
  "retry-after",
  "user-agent"
]);
var parseHeaders_default = (rawHeaders) => {
  const parsed = {};
  let key;
  let val;
  let i2;
  rawHeaders && rawHeaders.split("\n").forEach(function parser(line) {
    i2 = line.indexOf(":");
    key = line.substring(0, i2).trim().toLowerCase();
    val = line.substring(i2 + 1).trim();
    if (!key || parsed[key] && ignoreDuplicateOf[key]) {
      return;
    }
    if (key === "set-cookie") {
      if (parsed[key]) {
        parsed[key].push(val);
      } else {
        parsed[key] = [val];
      }
    } else {
      parsed[key] = parsed[key] ? parsed[key] + ", " + val : val;
    }
  });
  return parsed;
};

// node_modules/axios/lib/core/AxiosHeaders.js
var $internals = Symbol("internals");
function normalizeHeader(header) {
  return header && String(header).trim().toLowerCase();
}
function normalizeValue(value) {
  if (value === false || value == null) {
    return value;
  }
  return utils_default.isArray(value) ? value.map(normalizeValue) : String(value);
}
function parseTokens(str) {
  const tokens = /* @__PURE__ */ Object.create(null);
  const tokensRE = /([^\s,;=]+)\s*(?:=\s*([^,;]+))?/g;
  let match;
  while (match = tokensRE.exec(str)) {
    tokens[match[1]] = match[2];
  }
  return tokens;
}
var isValidHeaderName = (str) => /^[-_a-zA-Z0-9^`|~,!#$%&'*+.]+$/.test(str.trim());
function matchHeaderValue(context, value, header, filter2, isHeaderNameFilter) {
  if (utils_default.isFunction(filter2)) {
    return filter2.call(this, value, header);
  }
  if (isHeaderNameFilter) {
    value = header;
  }
  if (!utils_default.isString(value)) return;
  if (utils_default.isString(filter2)) {
    return value.indexOf(filter2) !== -1;
  }
  if (utils_default.isRegExp(filter2)) {
    return filter2.test(value);
  }
}
function formatHeader(header) {
  return header.trim().toLowerCase().replace(/([a-z\d])(\w*)/g, (w2, char, str) => {
    return char.toUpperCase() + str;
  });
}
function buildAccessors(obj, header) {
  const accessorName = utils_default.toCamelCase(" " + header);
  ["get", "set", "has"].forEach((methodName) => {
    Object.defineProperty(obj, methodName + accessorName, {
      value: function(arg1, arg2, arg3) {
        return this[methodName].call(this, header, arg1, arg2, arg3);
      },
      configurable: true
    });
  });
}
var AxiosHeaders = class {
  constructor(headers) {
    headers && this.set(headers);
  }
  set(header, valueOrRewrite, rewrite) {
    const self2 = this;
    function setHeader(_value, _header, _rewrite) {
      const lHeader = normalizeHeader(_header);
      if (!lHeader) {
        throw new Error("header name must be a non-empty string");
      }
      const key = utils_default.findKey(self2, lHeader);
      if (!key || self2[key] === void 0 || _rewrite === true || _rewrite === void 0 && self2[key] !== false) {
        self2[key || _header] = normalizeValue(_value);
      }
    }
    const setHeaders = (headers, _rewrite) => utils_default.forEach(headers, (_value, _header) => setHeader(_value, _header, _rewrite));
    if (utils_default.isPlainObject(header) || header instanceof this.constructor) {
      setHeaders(header, valueOrRewrite);
    } else if (utils_default.isString(header) && (header = header.trim()) && !isValidHeaderName(header)) {
      setHeaders(parseHeaders_default(header), valueOrRewrite);
    } else if (utils_default.isObject(header) && utils_default.isIterable(header)) {
      let obj = {}, dest, key;
      for (const entry of header) {
        if (!utils_default.isArray(entry)) {
          throw TypeError("Object iterator must return a key-value pair");
        }
        obj[key = entry[0]] = (dest = obj[key]) ? utils_default.isArray(dest) ? [...dest, entry[1]] : [dest, entry[1]] : entry[1];
      }
      setHeaders(obj, valueOrRewrite);
    } else {
      header != null && setHeader(valueOrRewrite, header, rewrite);
    }
    return this;
  }
  get(header, parser) {
    header = normalizeHeader(header);
    if (header) {
      const key = utils_default.findKey(this, header);
      if (key) {
        const value = this[key];
        if (!parser) {
          return value;
        }
        if (parser === true) {
          return parseTokens(value);
        }
        if (utils_default.isFunction(parser)) {
          return parser.call(this, value, key);
        }
        if (utils_default.isRegExp(parser)) {
          return parser.exec(value);
        }
        throw new TypeError("parser must be boolean|regexp|function");
      }
    }
  }
  has(header, matcher) {
    header = normalizeHeader(header);
    if (header) {
      const key = utils_default.findKey(this, header);
      return !!(key && this[key] !== void 0 && (!matcher || matchHeaderValue(this, this[key], key, matcher)));
    }
    return false;
  }
  delete(header, matcher) {
    const self2 = this;
    let deleted = false;
    function deleteHeader(_header) {
      _header = normalizeHeader(_header);
      if (_header) {
        const key = utils_default.findKey(self2, _header);
        if (key && (!matcher || matchHeaderValue(self2, self2[key], key, matcher))) {
          delete self2[key];
          deleted = true;
        }
      }
    }
    if (utils_default.isArray(header)) {
      header.forEach(deleteHeader);
    } else {
      deleteHeader(header);
    }
    return deleted;
  }
  clear(matcher) {
    const keys = Object.keys(this);
    let i2 = keys.length;
    let deleted = false;
    while (i2--) {
      const key = keys[i2];
      if (!matcher || matchHeaderValue(this, this[key], key, matcher, true)) {
        delete this[key];
        deleted = true;
      }
    }
    return deleted;
  }
  normalize(format) {
    const self2 = this;
    const headers = {};
    utils_default.forEach(this, (value, header) => {
      const key = utils_default.findKey(headers, header);
      if (key) {
        self2[key] = normalizeValue(value);
        delete self2[header];
        return;
      }
      const normalized = format ? formatHeader(header) : String(header).trim();
      if (normalized !== header) {
        delete self2[header];
      }
      self2[normalized] = normalizeValue(value);
      headers[normalized] = true;
    });
    return this;
  }
  concat(...targets) {
    return this.constructor.concat(this, ...targets);
  }
  toJSON(asStrings) {
    const obj = /* @__PURE__ */ Object.create(null);
    utils_default.forEach(this, (value, header) => {
      value != null && value !== false && (obj[header] = asStrings && utils_default.isArray(value) ? value.join(", ") : value);
    });
    return obj;
  }
  [Symbol.iterator]() {
    return Object.entries(this.toJSON())[Symbol.iterator]();
  }
  toString() {
    return Object.entries(this.toJSON()).map(([header, value]) => header + ": " + value).join("\n");
  }
  getSetCookie() {
    return this.get("set-cookie") || [];
  }
  get [Symbol.toStringTag]() {
    return "AxiosHeaders";
  }
  static from(thing) {
    return thing instanceof this ? thing : new this(thing);
  }
  static concat(first, ...targets) {
    const computed = new this(first);
    targets.forEach((target) => computed.set(target));
    return computed;
  }
  static accessor(header) {
    const internals = this[$internals] = this[$internals] = {
      accessors: {}
    };
    const accessors = internals.accessors;
    const prototype3 = this.prototype;
    function defineAccessor(_header) {
      const lHeader = normalizeHeader(_header);
      if (!accessors[lHeader]) {
        buildAccessors(prototype3, _header);
        accessors[lHeader] = true;
      }
    }
    utils_default.isArray(header) ? header.forEach(defineAccessor) : defineAccessor(header);
    return this;
  }
};
AxiosHeaders.accessor(["Content-Type", "Content-Length", "Accept", "Accept-Encoding", "User-Agent", "Authorization"]);
utils_default.reduceDescriptors(AxiosHeaders.prototype, ({ value }, key) => {
  let mapped = key[0].toUpperCase() + key.slice(1);
  return {
    get: () => value,
    set(headerValue) {
      this[mapped] = headerValue;
    }
  };
});
utils_default.freezeMethods(AxiosHeaders);
var AxiosHeaders_default = AxiosHeaders;

// node_modules/axios/lib/core/transformData.js
function transformData(fns, response) {
  const config = this || defaults_default;
  const context = response || config;
  const headers = AxiosHeaders_default.from(context.headers);
  let data = context.data;
  utils_default.forEach(fns, function transform(fn) {
    data = fn.call(config, data, headers.normalize(), response ? response.status : void 0);
  });
  headers.normalize();
  return data;
}

// node_modules/axios/lib/cancel/isCancel.js
function isCancel(value) {
  return !!(value && value.__CANCEL__);
}

// node_modules/axios/lib/cancel/CanceledError.js
function CanceledError(message, config, request) {
  AxiosError_default.call(this, message == null ? "canceled" : message, AxiosError_default.ERR_CANCELED, config, request);
  this.name = "CanceledError";
}
utils_default.inherits(CanceledError, AxiosError_default, {
  __CANCEL__: true
});
var CanceledError_default = CanceledError;

// node_modules/axios/lib/core/settle.js
function settle(resolve, reject, response) {
  const validateStatus2 = response.config.validateStatus;
  if (!response.status || !validateStatus2 || validateStatus2(response.status)) {
    resolve(response);
  } else {
    reject(new AxiosError_default(
      "Request failed with status code " + response.status,
      [AxiosError_default.ERR_BAD_REQUEST, AxiosError_default.ERR_BAD_RESPONSE][Math.floor(response.status / 100) - 4],
      response.config,
      response.request,
      response
    ));
  }
}

// node_modules/axios/lib/helpers/parseProtocol.js
function parseProtocol(url) {
  const match = /^([-+\w]{1,25})(:?\/\/|:)/.exec(url);
  return match && match[1] || "";
}

// node_modules/axios/lib/helpers/speedometer.js
function speedometer(samplesCount, min) {
  samplesCount = samplesCount || 10;
  const bytes = new Array(samplesCount);
  const timestamps = new Array(samplesCount);
  let head = 0;
  let tail = 0;
  let firstSampleTS;
  min = min !== void 0 ? min : 1e3;
  return function push(chunkLength) {
    const now = Date.now();
    const startedAt = timestamps[tail];
    if (!firstSampleTS) {
      firstSampleTS = now;
    }
    bytes[head] = chunkLength;
    timestamps[head] = now;
    let i2 = tail;
    let bytesCount = 0;
    while (i2 !== head) {
      bytesCount += bytes[i2++];
      i2 = i2 % samplesCount;
    }
    head = (head + 1) % samplesCount;
    if (head === tail) {
      tail = (tail + 1) % samplesCount;
    }
    if (now - firstSampleTS < min) {
      return;
    }
    const passed = startedAt && now - startedAt;
    return passed ? Math.round(bytesCount * 1e3 / passed) : void 0;
  };
}
var speedometer_default = speedometer;

// node_modules/axios/lib/helpers/throttle.js
function throttle(fn, freq) {
  let timestamp = 0;
  let threshold = 1e3 / freq;
  let lastArgs;
  let timer;
  const invoke = (args, now = Date.now()) => {
    timestamp = now;
    lastArgs = null;
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    fn(...args);
  };
  const throttled = (...args) => {
    const now = Date.now();
    const passed = now - timestamp;
    if (passed >= threshold) {
      invoke(args, now);
    } else {
      lastArgs = args;
      if (!timer) {
        timer = setTimeout(() => {
          timer = null;
          invoke(lastArgs);
        }, threshold - passed);
      }
    }
  };
  const flush = () => lastArgs && invoke(lastArgs);
  return [throttled, flush];
}
var throttle_default = throttle;

// node_modules/axios/lib/helpers/progressEventReducer.js
var progressEventReducer = (listener, isDownloadStream, freq = 3) => {
  let bytesNotified = 0;
  const _speedometer = speedometer_default(50, 250);
  return throttle_default((e2) => {
    const loaded = e2.loaded;
    const total = e2.lengthComputable ? e2.total : void 0;
    const progressBytes = loaded - bytesNotified;
    const rate = _speedometer(progressBytes);
    const inRange = loaded <= total;
    bytesNotified = loaded;
    const data = {
      loaded,
      total,
      progress: total ? loaded / total : void 0,
      bytes: progressBytes,
      rate: rate ? rate : void 0,
      estimated: rate && total && inRange ? (total - loaded) / rate : void 0,
      event: e2,
      lengthComputable: total != null,
      [isDownloadStream ? "download" : "upload"]: true
    };
    listener(data);
  }, freq);
};
var progressEventDecorator = (total, throttled) => {
  const lengthComputable = total != null;
  return [(loaded) => throttled[0]({
    lengthComputable,
    total,
    loaded
  }), throttled[1]];
};
var asyncDecorator = (fn) => (...args) => utils_default.asap(() => fn(...args));

// node_modules/axios/lib/helpers/isURLSameOrigin.js
var isURLSameOrigin_default = platform_default.hasStandardBrowserEnv ? /* @__PURE__ */ ((origin2, isMSIE) => (url) => {
  url = new URL(url, platform_default.origin);
  return origin2.protocol === url.protocol && origin2.host === url.host && (isMSIE || origin2.port === url.port);
})(
  new URL(platform_default.origin),
  platform_default.navigator && /(msie|trident)/i.test(platform_default.navigator.userAgent)
) : () => true;

// node_modules/axios/lib/helpers/cookies.js
var cookies_default = platform_default.hasStandardBrowserEnv ? (
  // Standard browser envs support document.cookie
  {
    write(name, value, expires, path, domain, secure, sameSite) {
      if (typeof document === "undefined") return;
      const cookie = [`${name}=${encodeURIComponent(value)}`];
      if (utils_default.isNumber(expires)) {
        cookie.push(`expires=${new Date(expires).toUTCString()}`);
      }
      if (utils_default.isString(path)) {
        cookie.push(`path=${path}`);
      }
      if (utils_default.isString(domain)) {
        cookie.push(`domain=${domain}`);
      }
      if (secure === true) {
        cookie.push("secure");
      }
      if (utils_default.isString(sameSite)) {
        cookie.push(`SameSite=${sameSite}`);
      }
      document.cookie = cookie.join("; ");
    },
    read(name) {
      if (typeof document === "undefined") return null;
      const match = document.cookie.match(new RegExp("(?:^|; )" + name + "=([^;]*)"));
      return match ? decodeURIComponent(match[1]) : null;
    },
    remove(name) {
      this.write(name, "", Date.now() - 864e5, "/");
    }
  }
) : (
  // Non-standard browser env (web workers, react-native) lack needed support.
  {
    write() {
    },
    read() {
      return null;
    },
    remove() {
    }
  }
);

// node_modules/axios/lib/helpers/isAbsoluteURL.js
function isAbsoluteURL(url) {
  return /^([a-z][a-z\d+\-.]*:)?\/\//i.test(url);
}

// node_modules/axios/lib/helpers/combineURLs.js
function combineURLs(baseURL, relativeURL) {
  return relativeURL ? baseURL.replace(/\/?\/$/, "") + "/" + relativeURL.replace(/^\/+/, "") : baseURL;
}

// node_modules/axios/lib/core/buildFullPath.js
function buildFullPath(baseURL, requestedURL, allowAbsoluteUrls) {
  let isRelativeUrl = !isAbsoluteURL(requestedURL);
  if (baseURL && (isRelativeUrl || allowAbsoluteUrls == false)) {
    return combineURLs(baseURL, requestedURL);
  }
  return requestedURL;
}

// node_modules/axios/lib/core/mergeConfig.js
var headersToObject = (thing) => thing instanceof AxiosHeaders_default ? { ...thing } : thing;
function mergeConfig(config1, config2) {
  config2 = config2 || {};
  const config = {};
  function getMergedValue(target, source, prop, caseless) {
    if (utils_default.isPlainObject(target) && utils_default.isPlainObject(source)) {
      return utils_default.merge.call({ caseless }, target, source);
    } else if (utils_default.isPlainObject(source)) {
      return utils_default.merge({}, source);
    } else if (utils_default.isArray(source)) {
      return source.slice();
    }
    return source;
  }
  function mergeDeepProperties(a2, b3, prop, caseless) {
    if (!utils_default.isUndefined(b3)) {
      return getMergedValue(a2, b3, prop, caseless);
    } else if (!utils_default.isUndefined(a2)) {
      return getMergedValue(void 0, a2, prop, caseless);
    }
  }
  function valueFromConfig2(a2, b3) {
    if (!utils_default.isUndefined(b3)) {
      return getMergedValue(void 0, b3);
    }
  }
  function defaultToConfig2(a2, b3) {
    if (!utils_default.isUndefined(b3)) {
      return getMergedValue(void 0, b3);
    } else if (!utils_default.isUndefined(a2)) {
      return getMergedValue(void 0, a2);
    }
  }
  function mergeDirectKeys(a2, b3, prop) {
    if (prop in config2) {
      return getMergedValue(a2, b3);
    } else if (prop in config1) {
      return getMergedValue(void 0, a2);
    }
  }
  const mergeMap = {
    url: valueFromConfig2,
    method: valueFromConfig2,
    data: valueFromConfig2,
    baseURL: defaultToConfig2,
    transformRequest: defaultToConfig2,
    transformResponse: defaultToConfig2,
    paramsSerializer: defaultToConfig2,
    timeout: defaultToConfig2,
    timeoutMessage: defaultToConfig2,
    withCredentials: defaultToConfig2,
    withXSRFToken: defaultToConfig2,
    adapter: defaultToConfig2,
    responseType: defaultToConfig2,
    xsrfCookieName: defaultToConfig2,
    xsrfHeaderName: defaultToConfig2,
    onUploadProgress: defaultToConfig2,
    onDownloadProgress: defaultToConfig2,
    decompress: defaultToConfig2,
    maxContentLength: defaultToConfig2,
    maxBodyLength: defaultToConfig2,
    beforeRedirect: defaultToConfig2,
    transport: defaultToConfig2,
    httpAgent: defaultToConfig2,
    httpsAgent: defaultToConfig2,
    cancelToken: defaultToConfig2,
    socketPath: defaultToConfig2,
    responseEncoding: defaultToConfig2,
    validateStatus: mergeDirectKeys,
    headers: (a2, b3, prop) => mergeDeepProperties(headersToObject(a2), headersToObject(b3), prop, true)
  };
  utils_default.forEach(Object.keys({ ...config1, ...config2 }), function computeConfigValue(prop) {
    const merge2 = mergeMap[prop] || mergeDeepProperties;
    const configValue = merge2(config1[prop], config2[prop], prop);
    utils_default.isUndefined(configValue) && merge2 !== mergeDirectKeys || (config[prop] = configValue);
  });
  return config;
}

// node_modules/axios/lib/helpers/resolveConfig.js
var resolveConfig_default = (config) => {
  const newConfig = mergeConfig({}, config);
  let { data, withXSRFToken, xsrfHeaderName, xsrfCookieName, headers, auth } = newConfig;
  newConfig.headers = headers = AxiosHeaders_default.from(headers);
  newConfig.url = buildURL(buildFullPath(newConfig.baseURL, newConfig.url, newConfig.allowAbsoluteUrls), config.params, config.paramsSerializer);
  if (auth) {
    headers.set(
      "Authorization",
      "Basic " + btoa((auth.username || "") + ":" + (auth.password ? unescape(encodeURIComponent(auth.password)) : ""))
    );
  }
  if (utils_default.isFormData(data)) {
    if (platform_default.hasStandardBrowserEnv || platform_default.hasStandardBrowserWebWorkerEnv) {
      headers.setContentType(void 0);
    } else if (utils_default.isFunction(data.getHeaders)) {
      const formHeaders = data.getHeaders();
      const allowedHeaders = ["content-type", "content-length"];
      Object.entries(formHeaders).forEach(([key, val]) => {
        if (allowedHeaders.includes(key.toLowerCase())) {
          headers.set(key, val);
        }
      });
    }
  }
  if (platform_default.hasStandardBrowserEnv) {
    withXSRFToken && utils_default.isFunction(withXSRFToken) && (withXSRFToken = withXSRFToken(newConfig));
    if (withXSRFToken || withXSRFToken !== false && isURLSameOrigin_default(newConfig.url)) {
      const xsrfValue = xsrfHeaderName && xsrfCookieName && cookies_default.read(xsrfCookieName);
      if (xsrfValue) {
        headers.set(xsrfHeaderName, xsrfValue);
      }
    }
  }
  return newConfig;
};

// node_modules/axios/lib/adapters/xhr.js
var isXHRAdapterSupported = typeof XMLHttpRequest !== "undefined";
var xhr_default = isXHRAdapterSupported && function(config) {
  return new Promise(function dispatchXhrRequest(resolve, reject) {
    const _config = resolveConfig_default(config);
    let requestData = _config.data;
    const requestHeaders = AxiosHeaders_default.from(_config.headers).normalize();
    let { responseType, onUploadProgress, onDownloadProgress } = _config;
    let onCanceled;
    let uploadThrottled, downloadThrottled;
    let flushUpload, flushDownload;
    function done() {
      flushUpload && flushUpload();
      flushDownload && flushDownload();
      _config.cancelToken && _config.cancelToken.unsubscribe(onCanceled);
      _config.signal && _config.signal.removeEventListener("abort", onCanceled);
    }
    let request = new XMLHttpRequest();
    request.open(_config.method.toUpperCase(), _config.url, true);
    request.timeout = _config.timeout;
    function onloadend() {
      if (!request) {
        return;
      }
      const responseHeaders = AxiosHeaders_default.from(
        "getAllResponseHeaders" in request && request.getAllResponseHeaders()
      );
      const responseData = !responseType || responseType === "text" || responseType === "json" ? request.responseText : request.response;
      const response = {
        data: responseData,
        status: request.status,
        statusText: request.statusText,
        headers: responseHeaders,
        config,
        request
      };
      settle(function _resolve(value) {
        resolve(value);
        done();
      }, function _reject(err) {
        reject(err);
        done();
      }, response);
      request = null;
    }
    if ("onloadend" in request) {
      request.onloadend = onloadend;
    } else {
      request.onreadystatechange = function handleLoad() {
        if (!request || request.readyState !== 4) {
          return;
        }
        if (request.status === 0 && !(request.responseURL && request.responseURL.indexOf("file:") === 0)) {
          return;
        }
        setTimeout(onloadend);
      };
    }
    request.onabort = function handleAbort() {
      if (!request) {
        return;
      }
      reject(new AxiosError_default("Request aborted", AxiosError_default.ECONNABORTED, config, request));
      request = null;
    };
    request.onerror = function handleError(event) {
      const msg = event && event.message ? event.message : "Network Error";
      const err = new AxiosError_default(msg, AxiosError_default.ERR_NETWORK, config, request);
      err.event = event || null;
      reject(err);
      request = null;
    };
    request.ontimeout = function handleTimeout() {
      let timeoutErrorMessage = _config.timeout ? "timeout of " + _config.timeout + "ms exceeded" : "timeout exceeded";
      const transitional2 = _config.transitional || transitional_default;
      if (_config.timeoutErrorMessage) {
        timeoutErrorMessage = _config.timeoutErrorMessage;
      }
      reject(new AxiosError_default(
        timeoutErrorMessage,
        transitional2.clarifyTimeoutError ? AxiosError_default.ETIMEDOUT : AxiosError_default.ECONNABORTED,
        config,
        request
      ));
      request = null;
    };
    requestData === void 0 && requestHeaders.setContentType(null);
    if ("setRequestHeader" in request) {
      utils_default.forEach(requestHeaders.toJSON(), function setRequestHeader(val, key) {
        request.setRequestHeader(key, val);
      });
    }
    if (!utils_default.isUndefined(_config.withCredentials)) {
      request.withCredentials = !!_config.withCredentials;
    }
    if (responseType && responseType !== "json") {
      request.responseType = _config.responseType;
    }
    if (onDownloadProgress) {
      [downloadThrottled, flushDownload] = progressEventReducer(onDownloadProgress, true);
      request.addEventListener("progress", downloadThrottled);
    }
    if (onUploadProgress && request.upload) {
      [uploadThrottled, flushUpload] = progressEventReducer(onUploadProgress);
      request.upload.addEventListener("progress", uploadThrottled);
      request.upload.addEventListener("loadend", flushUpload);
    }
    if (_config.cancelToken || _config.signal) {
      onCanceled = (cancel) => {
        if (!request) {
          return;
        }
        reject(!cancel || cancel.type ? new CanceledError_default(null, config, request) : cancel);
        request.abort();
        request = null;
      };
      _config.cancelToken && _config.cancelToken.subscribe(onCanceled);
      if (_config.signal) {
        _config.signal.aborted ? onCanceled() : _config.signal.addEventListener("abort", onCanceled);
      }
    }
    const protocol = parseProtocol(_config.url);
    if (protocol && platform_default.protocols.indexOf(protocol) === -1) {
      reject(new AxiosError_default("Unsupported protocol " + protocol + ":", AxiosError_default.ERR_BAD_REQUEST, config));
      return;
    }
    request.send(requestData || null);
  });
};

// node_modules/axios/lib/helpers/composeSignals.js
var composeSignals = (signals, timeout) => {
  const { length } = signals = signals ? signals.filter(Boolean) : [];
  if (timeout || length) {
    let controller = new AbortController();
    let aborted;
    const onabort = function(reason) {
      if (!aborted) {
        aborted = true;
        unsubscribe();
        const err = reason instanceof Error ? reason : this.reason;
        controller.abort(err instanceof AxiosError_default ? err : new CanceledError_default(err instanceof Error ? err.message : err));
      }
    };
    let timer = timeout && setTimeout(() => {
      timer = null;
      onabort(new AxiosError_default(`timeout ${timeout} of ms exceeded`, AxiosError_default.ETIMEDOUT));
    }, timeout);
    const unsubscribe = () => {
      if (signals) {
        timer && clearTimeout(timer);
        timer = null;
        signals.forEach((signal2) => {
          signal2.unsubscribe ? signal2.unsubscribe(onabort) : signal2.removeEventListener("abort", onabort);
        });
        signals = null;
      }
    };
    signals.forEach((signal2) => signal2.addEventListener("abort", onabort));
    const { signal } = controller;
    signal.unsubscribe = () => utils_default.asap(unsubscribe);
    return signal;
  }
};
var composeSignals_default = composeSignals;

// node_modules/axios/lib/helpers/trackStream.js
var streamChunk = function* (chunk, chunkSize) {
  let len = chunk.byteLength;
  if (!chunkSize || len < chunkSize) {
    yield chunk;
    return;
  }
  let pos = 0;
  let end;
  while (pos < len) {
    end = pos + chunkSize;
    yield chunk.slice(pos, end);
    pos = end;
  }
};
var readBytes = async function* (iterable, chunkSize) {
  for await (const chunk of readStream(iterable)) {
    yield* streamChunk(chunk, chunkSize);
  }
};
var readStream = async function* (stream) {
  if (stream[Symbol.asyncIterator]) {
    yield* stream;
    return;
  }
  const reader = stream.getReader();
  try {
    for (; ; ) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      yield value;
    }
  } finally {
    await reader.cancel();
  }
};
var trackStream = (stream, chunkSize, onProgress, onFinish) => {
  const iterator2 = readBytes(stream, chunkSize);
  let bytes = 0;
  let done;
  let _onFinish = (e2) => {
    if (!done) {
      done = true;
      onFinish && onFinish(e2);
    }
  };
  return new ReadableStream({
    async pull(controller) {
      try {
        const { done: done2, value } = await iterator2.next();
        if (done2) {
          _onFinish();
          controller.close();
          return;
        }
        let len = value.byteLength;
        if (onProgress) {
          let loadedBytes = bytes += len;
          onProgress(loadedBytes);
        }
        controller.enqueue(new Uint8Array(value));
      } catch (err) {
        _onFinish(err);
        throw err;
      }
    },
    cancel(reason) {
      _onFinish(reason);
      return iterator2.return();
    }
  }, {
    highWaterMark: 2
  });
};

// node_modules/axios/lib/adapters/fetch.js
var DEFAULT_CHUNK_SIZE = 64 * 1024;
var { isFunction: isFunction2 } = utils_default;
var globalFetchAPI = (({ Request, Response }) => ({
  Request,
  Response
}))(utils_default.global);
var {
  ReadableStream: ReadableStream2,
  TextEncoder
} = utils_default.global;
var test = (fn, ...args) => {
  try {
    return !!fn(...args);
  } catch (e2) {
    return false;
  }
};
var factory = (env) => {
  env = utils_default.merge.call({
    skipUndefined: true
  }, globalFetchAPI, env);
  const { fetch: envFetch, Request, Response } = env;
  const isFetchSupported = envFetch ? isFunction2(envFetch) : typeof fetch === "function";
  const isRequestSupported = isFunction2(Request);
  const isResponseSupported = isFunction2(Response);
  if (!isFetchSupported) {
    return false;
  }
  const isReadableStreamSupported = isFetchSupported && isFunction2(ReadableStream2);
  const encodeText = isFetchSupported && (typeof TextEncoder === "function" ? /* @__PURE__ */ ((encoder) => (str) => encoder.encode(str))(new TextEncoder()) : async (str) => new Uint8Array(await new Request(str).arrayBuffer()));
  const supportsRequestStream = isRequestSupported && isReadableStreamSupported && test(() => {
    let duplexAccessed = false;
    const hasContentType = new Request(platform_default.origin, {
      body: new ReadableStream2(),
      method: "POST",
      get duplex() {
        duplexAccessed = true;
        return "half";
      }
    }).headers.has("Content-Type");
    return duplexAccessed && !hasContentType;
  });
  const supportsResponseStream = isResponseSupported && isReadableStreamSupported && test(() => utils_default.isReadableStream(new Response("").body));
  const resolvers = {
    stream: supportsResponseStream && ((res) => res.body)
  };
  isFetchSupported && (() => {
    ["text", "arrayBuffer", "blob", "formData", "stream"].forEach((type) => {
      !resolvers[type] && (resolvers[type] = (res, config) => {
        let method = res && res[type];
        if (method) {
          return method.call(res);
        }
        throw new AxiosError_default(`Response type '${type}' is not supported`, AxiosError_default.ERR_NOT_SUPPORT, config);
      });
    });
  })();
  const getBodyLength = async (body) => {
    if (body == null) {
      return 0;
    }
    if (utils_default.isBlob(body)) {
      return body.size;
    }
    if (utils_default.isSpecCompliantForm(body)) {
      const _request = new Request(platform_default.origin, {
        method: "POST",
        body
      });
      return (await _request.arrayBuffer()).byteLength;
    }
    if (utils_default.isArrayBufferView(body) || utils_default.isArrayBuffer(body)) {
      return body.byteLength;
    }
    if (utils_default.isURLSearchParams(body)) {
      body = body + "";
    }
    if (utils_default.isString(body)) {
      return (await encodeText(body)).byteLength;
    }
  };
  const resolveBodyLength = async (headers, body) => {
    const length = utils_default.toFiniteNumber(headers.getContentLength());
    return length == null ? getBodyLength(body) : length;
  };
  return async (config) => {
    let {
      url,
      method,
      data,
      signal,
      cancelToken,
      timeout,
      onDownloadProgress,
      onUploadProgress,
      responseType,
      headers,
      withCredentials = "same-origin",
      fetchOptions
    } = resolveConfig_default(config);
    let _fetch = envFetch || fetch;
    responseType = responseType ? (responseType + "").toLowerCase() : "text";
    let composedSignal = composeSignals_default([signal, cancelToken && cancelToken.toAbortSignal()], timeout);
    let request = null;
    const unsubscribe = composedSignal && composedSignal.unsubscribe && (() => {
      composedSignal.unsubscribe();
    });
    let requestContentLength;
    try {
      if (onUploadProgress && supportsRequestStream && method !== "get" && method !== "head" && (requestContentLength = await resolveBodyLength(headers, data)) !== 0) {
        let _request = new Request(url, {
          method: "POST",
          body: data,
          duplex: "half"
        });
        let contentTypeHeader;
        if (utils_default.isFormData(data) && (contentTypeHeader = _request.headers.get("content-type"))) {
          headers.setContentType(contentTypeHeader);
        }
        if (_request.body) {
          const [onProgress, flush] = progressEventDecorator(
            requestContentLength,
            progressEventReducer(asyncDecorator(onUploadProgress))
          );
          data = trackStream(_request.body, DEFAULT_CHUNK_SIZE, onProgress, flush);
        }
      }
      if (!utils_default.isString(withCredentials)) {
        withCredentials = withCredentials ? "include" : "omit";
      }
      const isCredentialsSupported = isRequestSupported && "credentials" in Request.prototype;
      const resolvedOptions = {
        ...fetchOptions,
        signal: composedSignal,
        method: method.toUpperCase(),
        headers: headers.normalize().toJSON(),
        body: data,
        duplex: "half",
        credentials: isCredentialsSupported ? withCredentials : void 0
      };
      request = isRequestSupported && new Request(url, resolvedOptions);
      let response = await (isRequestSupported ? _fetch(request, fetchOptions) : _fetch(url, resolvedOptions));
      const isStreamResponse = supportsResponseStream && (responseType === "stream" || responseType === "response");
      if (supportsResponseStream && (onDownloadProgress || isStreamResponse && unsubscribe)) {
        const options = {};
        ["status", "statusText", "headers"].forEach((prop) => {
          options[prop] = response[prop];
        });
        const responseContentLength = utils_default.toFiniteNumber(response.headers.get("content-length"));
        const [onProgress, flush] = onDownloadProgress && progressEventDecorator(
          responseContentLength,
          progressEventReducer(asyncDecorator(onDownloadProgress), true)
        ) || [];
        response = new Response(
          trackStream(response.body, DEFAULT_CHUNK_SIZE, onProgress, () => {
            flush && flush();
            unsubscribe && unsubscribe();
          }),
          options
        );
      }
      responseType = responseType || "text";
      let responseData = await resolvers[utils_default.findKey(resolvers, responseType) || "text"](response, config);
      !isStreamResponse && unsubscribe && unsubscribe();
      return await new Promise((resolve, reject) => {
        settle(resolve, reject, {
          data: responseData,
          headers: AxiosHeaders_default.from(response.headers),
          status: response.status,
          statusText: response.statusText,
          config,
          request
        });
      });
    } catch (err) {
      unsubscribe && unsubscribe();
      if (err && err.name === "TypeError" && /Load failed|fetch/i.test(err.message)) {
        throw Object.assign(
          new AxiosError_default("Network Error", AxiosError_default.ERR_NETWORK, config, request),
          {
            cause: err.cause || err
          }
        );
      }
      throw AxiosError_default.from(err, err && err.code, config, request);
    }
  };
};
var seedCache = /* @__PURE__ */ new Map();
var getFetch = (config) => {
  let env = config && config.env || {};
  const { fetch: fetch2, Request, Response } = env;
  const seeds = [
    Request,
    Response,
    fetch2
  ];
  let len = seeds.length, i2 = len, seed, target, map = seedCache;
  while (i2--) {
    seed = seeds[i2];
    target = map.get(seed);
    target === void 0 && map.set(seed, target = i2 ? /* @__PURE__ */ new Map() : factory(env));
    map = target;
  }
  return target;
};
var adapter = getFetch();

// node_modules/axios/lib/adapters/adapters.js
var knownAdapters = {
  http: null_default,
  xhr: xhr_default,
  fetch: {
    get: getFetch
  }
};
utils_default.forEach(knownAdapters, (fn, value) => {
  if (fn) {
    try {
      Object.defineProperty(fn, "name", { value });
    } catch (e2) {
    }
    Object.defineProperty(fn, "adapterName", { value });
  }
});
var renderReason = (reason) => `- ${reason}`;
var isResolvedHandle = (adapter2) => utils_default.isFunction(adapter2) || adapter2 === null || adapter2 === false;
function getAdapter(adapters, config) {
  adapters = utils_default.isArray(adapters) ? adapters : [adapters];
  const { length } = adapters;
  let nameOrAdapter;
  let adapter2;
  const rejectedReasons = {};
  for (let i2 = 0; i2 < length; i2++) {
    nameOrAdapter = adapters[i2];
    let id;
    adapter2 = nameOrAdapter;
    if (!isResolvedHandle(nameOrAdapter)) {
      adapter2 = knownAdapters[(id = String(nameOrAdapter)).toLowerCase()];
      if (adapter2 === void 0) {
        throw new AxiosError_default(`Unknown adapter '${id}'`);
      }
    }
    if (adapter2 && (utils_default.isFunction(adapter2) || (adapter2 = adapter2.get(config)))) {
      break;
    }
    rejectedReasons[id || "#" + i2] = adapter2;
  }
  if (!adapter2) {
    const reasons = Object.entries(rejectedReasons).map(
      ([id, state]) => `adapter ${id} ` + (state === false ? "is not supported by the environment" : "is not available in the build")
    );
    let s2 = length ? reasons.length > 1 ? "since :\n" + reasons.map(renderReason).join("\n") : " " + renderReason(reasons[0]) : "as no adapter specified";
    throw new AxiosError_default(
      `There is no suitable adapter to dispatch the request ` + s2,
      "ERR_NOT_SUPPORT"
    );
  }
  return adapter2;
}
var adapters_default = {
  /**
   * Resolve an adapter from a list of adapter names or functions.
   * @type {Function}
   */
  getAdapter,
  /**
   * Exposes all known adapters
   * @type {Object<string, Function|Object>}
   */
  adapters: knownAdapters
};

// node_modules/axios/lib/core/dispatchRequest.js
function throwIfCancellationRequested(config) {
  if (config.cancelToken) {
    config.cancelToken.throwIfRequested();
  }
  if (config.signal && config.signal.aborted) {
    throw new CanceledError_default(null, config);
  }
}
function dispatchRequest(config) {
  throwIfCancellationRequested(config);
  config.headers = AxiosHeaders_default.from(config.headers);
  config.data = transformData.call(
    config,
    config.transformRequest
  );
  if (["post", "put", "patch"].indexOf(config.method) !== -1) {
    config.headers.setContentType("application/x-www-form-urlencoded", false);
  }
  const adapter2 = adapters_default.getAdapter(config.adapter || defaults_default.adapter, config);
  return adapter2(config).then(function onAdapterResolution(response) {
    throwIfCancellationRequested(config);
    response.data = transformData.call(
      config,
      config.transformResponse,
      response
    );
    response.headers = AxiosHeaders_default.from(response.headers);
    return response;
  }, function onAdapterRejection(reason) {
    if (!isCancel(reason)) {
      throwIfCancellationRequested(config);
      if (reason && reason.response) {
        reason.response.data = transformData.call(
          config,
          config.transformResponse,
          reason.response
        );
        reason.response.headers = AxiosHeaders_default.from(reason.response.headers);
      }
    }
    return Promise.reject(reason);
  });
}

// node_modules/axios/lib/env/data.js
var VERSION = "1.13.2";

// node_modules/axios/lib/helpers/validator.js
var validators = {};
["object", "boolean", "number", "function", "string", "symbol"].forEach((type, i2) => {
  validators[type] = function validator(thing) {
    return typeof thing === type || "a" + (i2 < 1 ? "n " : " ") + type;
  };
});
var deprecatedWarnings = {};
validators.transitional = function transitional(validator, version, message) {
  function formatMessage(opt, desc) {
    return "[Axios v" + VERSION + "] Transitional option '" + opt + "'" + desc + (message ? ". " + message : "");
  }
  return (value, opt, opts) => {
    if (validator === false) {
      throw new AxiosError_default(
        formatMessage(opt, " has been removed" + (version ? " in " + version : "")),
        AxiosError_default.ERR_DEPRECATED
      );
    }
    if (version && !deprecatedWarnings[opt]) {
      deprecatedWarnings[opt] = true;
      console.warn(
        formatMessage(
          opt,
          " has been deprecated since v" + version + " and will be removed in the near future"
        )
      );
    }
    return validator ? validator(value, opt, opts) : true;
  };
};
validators.spelling = function spelling(correctSpelling) {
  return (value, opt) => {
    console.warn(`${opt} is likely a misspelling of ${correctSpelling}`);
    return true;
  };
};
function assertOptions(options, schema, allowUnknown) {
  if (typeof options !== "object") {
    throw new AxiosError_default("options must be an object", AxiosError_default.ERR_BAD_OPTION_VALUE);
  }
  const keys = Object.keys(options);
  let i2 = keys.length;
  while (i2-- > 0) {
    const opt = keys[i2];
    const validator = schema[opt];
    if (validator) {
      const value = options[opt];
      const result = value === void 0 || validator(value, opt, options);
      if (result !== true) {
        throw new AxiosError_default("option " + opt + " must be " + result, AxiosError_default.ERR_BAD_OPTION_VALUE);
      }
      continue;
    }
    if (allowUnknown !== true) {
      throw new AxiosError_default("Unknown option " + opt, AxiosError_default.ERR_BAD_OPTION);
    }
  }
}
var validator_default = {
  assertOptions,
  validators
};

// node_modules/axios/lib/core/Axios.js
var validators2 = validator_default.validators;
var Axios = class {
  constructor(instanceConfig) {
    this.defaults = instanceConfig || {};
    this.interceptors = {
      request: new InterceptorManager_default(),
      response: new InterceptorManager_default()
    };
  }
  /**
   * Dispatch a request
   *
   * @param {String|Object} configOrUrl The config specific for this request (merged with this.defaults)
   * @param {?Object} config
   *
   * @returns {Promise} The Promise to be fulfilled
   */
  async request(configOrUrl, config) {
    try {
      return await this._request(configOrUrl, config);
    } catch (err) {
      if (err instanceof Error) {
        let dummy = {};
        Error.captureStackTrace ? Error.captureStackTrace(dummy) : dummy = new Error();
        const stack = dummy.stack ? dummy.stack.replace(/^.+\n/, "") : "";
        try {
          if (!err.stack) {
            err.stack = stack;
          } else if (stack && !String(err.stack).endsWith(stack.replace(/^.+\n.+\n/, ""))) {
            err.stack += "\n" + stack;
          }
        } catch (e2) {
        }
      }
      throw err;
    }
  }
  _request(configOrUrl, config) {
    if (typeof configOrUrl === "string") {
      config = config || {};
      config.url = configOrUrl;
    } else {
      config = configOrUrl || {};
    }
    config = mergeConfig(this.defaults, config);
    const { transitional: transitional2, paramsSerializer, headers } = config;
    if (transitional2 !== void 0) {
      validator_default.assertOptions(transitional2, {
        silentJSONParsing: validators2.transitional(validators2.boolean),
        forcedJSONParsing: validators2.transitional(validators2.boolean),
        clarifyTimeoutError: validators2.transitional(validators2.boolean)
      }, false);
    }
    if (paramsSerializer != null) {
      if (utils_default.isFunction(paramsSerializer)) {
        config.paramsSerializer = {
          serialize: paramsSerializer
        };
      } else {
        validator_default.assertOptions(paramsSerializer, {
          encode: validators2.function,
          serialize: validators2.function
        }, true);
      }
    }
    if (config.allowAbsoluteUrls !== void 0) {
    } else if (this.defaults.allowAbsoluteUrls !== void 0) {
      config.allowAbsoluteUrls = this.defaults.allowAbsoluteUrls;
    } else {
      config.allowAbsoluteUrls = true;
    }
    validator_default.assertOptions(config, {
      baseUrl: validators2.spelling("baseURL"),
      withXsrfToken: validators2.spelling("withXSRFToken")
    }, true);
    config.method = (config.method || this.defaults.method || "get").toLowerCase();
    let contextHeaders = headers && utils_default.merge(
      headers.common,
      headers[config.method]
    );
    headers && utils_default.forEach(
      ["delete", "get", "head", "post", "put", "patch", "common"],
      (method) => {
        delete headers[method];
      }
    );
    config.headers = AxiosHeaders_default.concat(contextHeaders, headers);
    const requestInterceptorChain = [];
    let synchronousRequestInterceptors = true;
    this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
      if (typeof interceptor.runWhen === "function" && interceptor.runWhen(config) === false) {
        return;
      }
      synchronousRequestInterceptors = synchronousRequestInterceptors && interceptor.synchronous;
      requestInterceptorChain.unshift(interceptor.fulfilled, interceptor.rejected);
    });
    const responseInterceptorChain = [];
    this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
      responseInterceptorChain.push(interceptor.fulfilled, interceptor.rejected);
    });
    let promise;
    let i2 = 0;
    let len;
    if (!synchronousRequestInterceptors) {
      const chain = [dispatchRequest.bind(this), void 0];
      chain.unshift(...requestInterceptorChain);
      chain.push(...responseInterceptorChain);
      len = chain.length;
      promise = Promise.resolve(config);
      while (i2 < len) {
        promise = promise.then(chain[i2++], chain[i2++]);
      }
      return promise;
    }
    len = requestInterceptorChain.length;
    let newConfig = config;
    while (i2 < len) {
      const onFulfilled = requestInterceptorChain[i2++];
      const onRejected = requestInterceptorChain[i2++];
      try {
        newConfig = onFulfilled(newConfig);
      } catch (error) {
        onRejected.call(this, error);
        break;
      }
    }
    try {
      promise = dispatchRequest.call(this, newConfig);
    } catch (error) {
      return Promise.reject(error);
    }
    i2 = 0;
    len = responseInterceptorChain.length;
    while (i2 < len) {
      promise = promise.then(responseInterceptorChain[i2++], responseInterceptorChain[i2++]);
    }
    return promise;
  }
  getUri(config) {
    config = mergeConfig(this.defaults, config);
    const fullPath = buildFullPath(config.baseURL, config.url, config.allowAbsoluteUrls);
    return buildURL(fullPath, config.params, config.paramsSerializer);
  }
};
utils_default.forEach(["delete", "get", "head", "options"], function forEachMethodNoData(method) {
  Axios.prototype[method] = function(url, config) {
    return this.request(mergeConfig(config || {}, {
      method,
      url,
      data: (config || {}).data
    }));
  };
});
utils_default.forEach(["post", "put", "patch"], function forEachMethodWithData(method) {
  function generateHTTPMethod(isForm) {
    return function httpMethod(url, data, config) {
      return this.request(mergeConfig(config || {}, {
        method,
        headers: isForm ? {
          "Content-Type": "multipart/form-data"
        } : {},
        url,
        data
      }));
    };
  }
  Axios.prototype[method] = generateHTTPMethod();
  Axios.prototype[method + "Form"] = generateHTTPMethod(true);
});
var Axios_default = Axios;

// node_modules/axios/lib/cancel/CancelToken.js
var CancelToken = class _CancelToken {
  constructor(executor) {
    if (typeof executor !== "function") {
      throw new TypeError("executor must be a function.");
    }
    let resolvePromise;
    this.promise = new Promise(function promiseExecutor(resolve) {
      resolvePromise = resolve;
    });
    const token = this;
    this.promise.then((cancel) => {
      if (!token._listeners) return;
      let i2 = token._listeners.length;
      while (i2-- > 0) {
        token._listeners[i2](cancel);
      }
      token._listeners = null;
    });
    this.promise.then = (onfulfilled) => {
      let _resolve;
      const promise = new Promise((resolve) => {
        token.subscribe(resolve);
        _resolve = resolve;
      }).then(onfulfilled);
      promise.cancel = function reject() {
        token.unsubscribe(_resolve);
      };
      return promise;
    };
    executor(function cancel(message, config, request) {
      if (token.reason) {
        return;
      }
      token.reason = new CanceledError_default(message, config, request);
      resolvePromise(token.reason);
    });
  }
  /**
   * Throws a `CanceledError` if cancellation has been requested.
   */
  throwIfRequested() {
    if (this.reason) {
      throw this.reason;
    }
  }
  /**
   * Subscribe to the cancel signal
   */
  subscribe(listener) {
    if (this.reason) {
      listener(this.reason);
      return;
    }
    if (this._listeners) {
      this._listeners.push(listener);
    } else {
      this._listeners = [listener];
    }
  }
  /**
   * Unsubscribe from the cancel signal
   */
  unsubscribe(listener) {
    if (!this._listeners) {
      return;
    }
    const index = this._listeners.indexOf(listener);
    if (index !== -1) {
      this._listeners.splice(index, 1);
    }
  }
  toAbortSignal() {
    const controller = new AbortController();
    const abort = (err) => {
      controller.abort(err);
    };
    this.subscribe(abort);
    controller.signal.unsubscribe = () => this.unsubscribe(abort);
    return controller.signal;
  }
  /**
   * Returns an object that contains a new `CancelToken` and a function that, when called,
   * cancels the `CancelToken`.
   */
  static source() {
    let cancel;
    const token = new _CancelToken(function executor(c2) {
      cancel = c2;
    });
    return {
      token,
      cancel
    };
  }
};
var CancelToken_default = CancelToken;

// node_modules/axios/lib/helpers/spread.js
function spread(callback) {
  return function wrap(arr) {
    return callback.apply(null, arr);
  };
}

// node_modules/axios/lib/helpers/isAxiosError.js
function isAxiosError(payload) {
  return utils_default.isObject(payload) && payload.isAxiosError === true;
}

// node_modules/axios/lib/helpers/HttpStatusCode.js
var HttpStatusCode = {
  Continue: 100,
  SwitchingProtocols: 101,
  Processing: 102,
  EarlyHints: 103,
  Ok: 200,
  Created: 201,
  Accepted: 202,
  NonAuthoritativeInformation: 203,
  NoContent: 204,
  ResetContent: 205,
  PartialContent: 206,
  MultiStatus: 207,
  AlreadyReported: 208,
  ImUsed: 226,
  MultipleChoices: 300,
  MovedPermanently: 301,
  Found: 302,
  SeeOther: 303,
  NotModified: 304,
  UseProxy: 305,
  Unused: 306,
  TemporaryRedirect: 307,
  PermanentRedirect: 308,
  BadRequest: 400,
  Unauthorized: 401,
  PaymentRequired: 402,
  Forbidden: 403,
  NotFound: 404,
  MethodNotAllowed: 405,
  NotAcceptable: 406,
  ProxyAuthenticationRequired: 407,
  RequestTimeout: 408,
  Conflict: 409,
  Gone: 410,
  LengthRequired: 411,
  PreconditionFailed: 412,
  PayloadTooLarge: 413,
  UriTooLong: 414,
  UnsupportedMediaType: 415,
  RangeNotSatisfiable: 416,
  ExpectationFailed: 417,
  ImATeapot: 418,
  MisdirectedRequest: 421,
  UnprocessableEntity: 422,
  Locked: 423,
  FailedDependency: 424,
  TooEarly: 425,
  UpgradeRequired: 426,
  PreconditionRequired: 428,
  TooManyRequests: 429,
  RequestHeaderFieldsTooLarge: 431,
  UnavailableForLegalReasons: 451,
  InternalServerError: 500,
  NotImplemented: 501,
  BadGateway: 502,
  ServiceUnavailable: 503,
  GatewayTimeout: 504,
  HttpVersionNotSupported: 505,
  VariantAlsoNegotiates: 506,
  InsufficientStorage: 507,
  LoopDetected: 508,
  NotExtended: 510,
  NetworkAuthenticationRequired: 511,
  WebServerIsDown: 521,
  ConnectionTimedOut: 522,
  OriginIsUnreachable: 523,
  TimeoutOccurred: 524,
  SslHandshakeFailed: 525,
  InvalidSslCertificate: 526
};
Object.entries(HttpStatusCode).forEach(([key, value]) => {
  HttpStatusCode[value] = key;
});
var HttpStatusCode_default = HttpStatusCode;

// node_modules/axios/lib/axios.js
function createInstance(defaultConfig) {
  const context = new Axios_default(defaultConfig);
  const instance = bind(Axios_default.prototype.request, context);
  utils_default.extend(instance, Axios_default.prototype, context, { allOwnKeys: true });
  utils_default.extend(instance, context, null, { allOwnKeys: true });
  instance.create = function create2(instanceConfig) {
    return createInstance(mergeConfig(defaultConfig, instanceConfig));
  };
  return instance;
}
var axios = createInstance(defaults_default);
axios.Axios = Axios_default;
axios.CanceledError = CanceledError_default;
axios.CancelToken = CancelToken_default;
axios.isCancel = isCancel;
axios.VERSION = VERSION;
axios.toFormData = toFormData_default;
axios.AxiosError = AxiosError_default;
axios.Cancel = axios.CanceledError;
axios.all = function all(promises) {
  return Promise.all(promises);
};
axios.spread = spread;
axios.isAxiosError = isAxiosError;
axios.mergeConfig = mergeConfig;
axios.AxiosHeaders = AxiosHeaders_default;
axios.formToJSON = (thing) => formDataToJSON_default(utils_default.isHTMLForm(thing) ? new FormData(thing) : thing);
axios.getAdapter = adapters_default.getAdapter;
axios.HttpStatusCode = HttpStatusCode_default;
axios.default = axios;
var axios_default = axios;

// node_modules/axios/index.js
var {
  Axios: Axios2,
  AxiosError: AxiosError2,
  CanceledError: CanceledError2,
  isCancel: isCancel2,
  CancelToken: CancelToken2,
  VERSION: VERSION2,
  all: all2,
  Cancel,
  isAxiosError: isAxiosError2,
  spread: spread2,
  toFormData: toFormData2,
  AxiosHeaders: AxiosHeaders2,
  HttpStatusCode: HttpStatusCode2,
  formToJSON,
  getAdapter: getAdapter2,
  mergeConfig: mergeConfig2
} = axios_default;

// src/api/backend.js
var API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
var api = axios_default.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json"
  }
});
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// src/api/airports.js
var BACKEND_API2 = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
async function getAllAirports() {
  const cacheKey = "all_airports_v1";
  const cached = localStorage.getItem(cacheKey);
  if (cached) {
    const { data, timestamp } = JSON.parse(cached);
    const age = Date.now() - timestamp;
    if (age < 24 * 60 * 60 * 1e3) {
      console.log("\u2705 Lotniska z cache (24h)");
      return data;
    }
  }
  console.log("\u{1F504} Pobieranie lotnisk z bazy danych...");
  try {
    const response = await fetch(`${BACKEND_API2}/airports?limit=1000`);
    const result = await response.json();
    if (!result.success) {
      throw new Error("Nie uda\u0142o si\u0119 pobra\u0107 lotnisk");
    }
    const airports = result.airports;
    console.log(`\u2705 Pobrano ${airports.length} lotnisk z bazy`);
    localStorage.setItem(cacheKey, JSON.stringify({
      data: airports,
      timestamp: Date.now()
    }));
    return airports;
  } catch (error) {
    console.error("\u274C B\u0142\u0105d pobierania lotnisk:", error);
    if (cached) {
      const { data } = JSON.parse(cached);
      return data;
    }
    return [];
  }
}
function groupAirportsByCountry(airports) {
  const grouped = {};
  for (const airport of airports) {
    const countryCode = airport.country.code;
    const countryName = airport.country.name;
    if (!grouped[countryCode]) {
      grouped[countryCode] = {
        code: countryCode,
        name: countryName,
        currency: airport.country.currency,
        schengen: airport.country.schengen,
        cities: {}
      };
    }
    const cityCode = airport.city.code;
    const cityName = airport.city.name;
    if (!grouped[countryCode].cities[cityCode]) {
      grouped[countryCode].cities[cityCode] = {
        code: cityCode,
        name: cityName,
        airports: []
      };
    }
    grouped[countryCode].cities[cityCode].airports.push({
      code: airport.code,
      name: airport.name,
      base: airport.base,
      coordinates: airport.coordinates
    });
  }
  return grouped;
}
async function getAvailableDestinations(originCode) {
  if (!originCode) {
    return [];
  }
  console.log(`\u{1F50D} Sprawdzam dost\u0119pne po\u0142\u0105czenia z ${originCode}...`);
  try {
    const response = await safeRyanairFetch(`${BACKEND_API2}/ryanair/routes?origin=${originCode}&market=pl-pl`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const data = await response.json();
    const destinationCodes = data.destinations || [];
    console.log(`\u2705 Znaleziono ${destinationCodes.length} po\u0142\u0105cze\u0144 z ${originCode}`);
    if (destinationCodes.length > 0) {
      console.log(`   Przyk\u0142ady: ${destinationCodes.slice(0, 10).join(", ")}`);
    }
    return destinationCodes;
  } catch (error) {
    console.error(`\u274C B\u0142\u0105d pobierania po\u0142\u0105cze\u0144 z ${originCode}:`, error);
    if (error?.hardBlocked) throw error;
    return [];
  }
}
async function getFilteredDestinations(originCode, allAirports) {
  const availableCodes = await getAvailableDestinations(originCode);
  if (availableCodes.length === 0) {
    console.warn(`\u26A0\uFE0F Brak dost\u0119pnych po\u0142\u0105cze\u0144 z ${originCode}`);
    return [];
  }
  const filtered = allAirports.filter(
    (airport) => availableCodes.includes(airport.code)
  );
  console.log(`\u2705 Dost\u0119pne cele z ${originCode}: ${filtered.length} lotnisk`);
  return filtered;
}
async function getRoutesFromAirport(airportCode) {
  if (!globalThis.__routesCache) globalThis.__routesCache = /* @__PURE__ */ new Map();
  const cacheKey = `routes:${airportCode}`;
  if (globalThis.__routesCache.has(cacheKey)) {
    const entry = globalThis.__routesCache.get(cacheKey);
    if (entry.expires > Date.now()) {
      console.log(`\u{1F4BE} routes cache hit for ${airportCode}`);
      return entry.routes;
    } else {
      globalThis.__routesCache.delete(cacheKey);
    }
  }
  const url = `${BACKEND_API2.replace(/\/+$|\/api$/, "")}/api/ryanair/routes?origin=${airportCode}&market=pl-pl`;
  console.log(`\u{1F50D} Sprawdzam dost\u0119pne po\u0142\u0105czenia z ${airportCode}...`);
  try {
    const response = await safeRyanairFetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const data = await response.json();
    if (data.destinations && Array.isArray(data.destinations)) {
      console.log(`\u2705 Znaleziono ${data.destinations.length} po\u0142\u0105cze\u0144 z ${airportCode}`);
      globalThis.__routesCache.set(cacheKey, { routes: data.destinations, expires: Date.now() + 12 * 60 * 60 * 1e3 });
      return data.destinations;
    }
    return [];
  } catch (error) {
    console.error(`\u274C B\u0142\u0105d pobierania tras z ${airportCode}:`, error.message);
    if (error?.hardBlocked) throw error;
    return [];
  }
}

// src/utils/time.js
function minutesToTime(m2) {
  const hh = Math.floor(m2 / 60).toString().padStart(2, "0");
  const mm = (m2 % 60).toString().padStart(2, "0");
  return `${hh}:${mm}`;
}
function timeToMinutes(t2) {
  if (!t2) return 0;
  const parts = t2.split(":");
  if (parts.length !== 2) return 0;
  const hh = parseInt(parts[0], 10);
  const mm = parseInt(parts[1], 10);
  return (hh || 0) * 60 + (mm || 0);
}

// node_modules/zustand/esm/vanilla.mjs
var createStoreImpl = (createState) => {
  let state;
  const listeners = /* @__PURE__ */ new Set();
  const setState = (partial, replace) => {
    const nextState = typeof partial === "function" ? partial(state) : partial;
    if (!Object.is(nextState, state)) {
      const previousState = state;
      state = (replace != null ? replace : typeof nextState !== "object" || nextState === null) ? nextState : Object.assign({}, state, nextState);
      listeners.forEach((listener) => listener(state, previousState));
    }
  };
  const getState = () => state;
  const getInitialState = () => initialState;
  const subscribe = (listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };
  const destroy = () => {
    if ((import.meta.env ? import.meta.env.MODE : void 0) !== "production") {
      console.warn(
        "[DEPRECATED] The `destroy` method will be unsupported in a future version. Instead use unsubscribe function returned by subscribe. Everything will be garbage-collected if store is garbage-collected."
      );
    }
    listeners.clear();
  };
  const api2 = { setState, getState, getInitialState, subscribe, destroy };
  const initialState = state = createState(setState, getState, api2);
  return api2;
};
var createStore = (createState) => createState ? createStoreImpl(createState) : createStoreImpl;

// node_modules/zustand/esm/index.mjs
var import_react2 = __toESM(require_react(), 1);
var import_with_selector = __toESM(require_with_selector(), 1);
var { useDebugValue } = import_react2.default;
var { useSyncExternalStoreWithSelector } = import_with_selector.default;
var didWarnAboutEqualityFn = false;
var identity = (arg) => arg;
function useStore(api2, selector = identity, equalityFn) {
  if ((import.meta.env ? import.meta.env.MODE : void 0) !== "production" && equalityFn && !didWarnAboutEqualityFn) {
    console.warn(
      "[DEPRECATED] Use `createWithEqualityFn` instead of `create` or use `useStoreWithEqualityFn` instead of `useStore`. They can be imported from 'zustand/traditional'. https://github.com/pmndrs/zustand/discussions/1937"
    );
    didWarnAboutEqualityFn = true;
  }
  const slice = useSyncExternalStoreWithSelector(
    api2.subscribe,
    api2.getState,
    api2.getServerState || api2.getInitialState,
    selector,
    equalityFn
  );
  useDebugValue(slice);
  return slice;
}
var createImpl = (createState) => {
  if ((import.meta.env ? import.meta.env.MODE : void 0) !== "production" && typeof createState !== "function") {
    console.warn(
      "[DEPRECATED] Passing a vanilla store will be unsupported in a future version. Instead use `import { useStore } from 'zustand'`."
    );
  }
  const api2 = typeof createState === "function" ? createStore(createState) : createState;
  const useBoundStore = (selector, equalityFn) => useStore(api2, selector, equalityFn);
  Object.assign(useBoundStore, api2);
  return useBoundStore;
};
var create = (createState) => createState ? createImpl(createState) : createImpl;

// node_modules/zustand/esm/middleware.mjs
function createJSONStorage(getStorage, options) {
  let storage;
  try {
    storage = getStorage();
  } catch (_e) {
    return;
  }
  const persistStorage = {
    getItem: (name) => {
      var _a;
      const parse = (str2) => {
        if (str2 === null) {
          return null;
        }
        return JSON.parse(str2, options == null ? void 0 : options.reviver);
      };
      const str = (_a = storage.getItem(name)) != null ? _a : null;
      if (str instanceof Promise) {
        return str.then(parse);
      }
      return parse(str);
    },
    setItem: (name, newValue) => storage.setItem(
      name,
      JSON.stringify(newValue, options == null ? void 0 : options.replacer)
    ),
    removeItem: (name) => storage.removeItem(name)
  };
  return persistStorage;
}
var toThenable = (fn) => (input) => {
  try {
    const result = fn(input);
    if (result instanceof Promise) {
      return result;
    }
    return {
      then(onFulfilled) {
        return toThenable(onFulfilled)(result);
      },
      catch(_onRejected) {
        return this;
      }
    };
  } catch (e2) {
    return {
      then(_onFulfilled) {
        return this;
      },
      catch(onRejected) {
        return toThenable(onRejected)(e2);
      }
    };
  }
};
var oldImpl = (config, baseOptions) => (set, get, api2) => {
  let options = {
    getStorage: () => localStorage,
    serialize: JSON.stringify,
    deserialize: JSON.parse,
    partialize: (state) => state,
    version: 0,
    merge: (persistedState, currentState) => ({
      ...currentState,
      ...persistedState
    }),
    ...baseOptions
  };
  let hasHydrated = false;
  const hydrationListeners = /* @__PURE__ */ new Set();
  const finishHydrationListeners = /* @__PURE__ */ new Set();
  let storage;
  try {
    storage = options.getStorage();
  } catch (_e) {
  }
  if (!storage) {
    return config(
      (...args) => {
        console.warn(
          `[zustand persist middleware] Unable to update item '${options.name}', the given storage is currently unavailable.`
        );
        set(...args);
      },
      get,
      api2
    );
  }
  const thenableSerialize = toThenable(options.serialize);
  const setItem = () => {
    const state = options.partialize({ ...get() });
    let errorInSync;
    const thenable = thenableSerialize({ state, version: options.version }).then(
      (serializedValue) => storage.setItem(options.name, serializedValue)
    ).catch((e2) => {
      errorInSync = e2;
    });
    if (errorInSync) {
      throw errorInSync;
    }
    return thenable;
  };
  const savedSetState = api2.setState;
  api2.setState = (state, replace) => {
    savedSetState(state, replace);
    void setItem();
  };
  const configResult = config(
    (...args) => {
      set(...args);
      void setItem();
    },
    get,
    api2
  );
  let stateFromStorage;
  const hydrate = () => {
    var _a;
    if (!storage) return;
    hasHydrated = false;
    hydrationListeners.forEach((cb) => cb(get()));
    const postRehydrationCallback = ((_a = options.onRehydrateStorage) == null ? void 0 : _a.call(options, get())) || void 0;
    return toThenable(storage.getItem.bind(storage))(options.name).then((storageValue) => {
      if (storageValue) {
        return options.deserialize(storageValue);
      }
    }).then((deserializedStorageValue) => {
      if (deserializedStorageValue) {
        if (typeof deserializedStorageValue.version === "number" && deserializedStorageValue.version !== options.version) {
          if (options.migrate) {
            return options.migrate(
              deserializedStorageValue.state,
              deserializedStorageValue.version
            );
          }
          console.error(
            `State loaded from storage couldn't be migrated since no migrate function was provided`
          );
        } else {
          return deserializedStorageValue.state;
        }
      }
    }).then((migratedState) => {
      var _a2;
      stateFromStorage = options.merge(
        migratedState,
        (_a2 = get()) != null ? _a2 : configResult
      );
      set(stateFromStorage, true);
      return setItem();
    }).then(() => {
      postRehydrationCallback == null ? void 0 : postRehydrationCallback(stateFromStorage, void 0);
      hasHydrated = true;
      finishHydrationListeners.forEach((cb) => cb(stateFromStorage));
    }).catch((e2) => {
      postRehydrationCallback == null ? void 0 : postRehydrationCallback(void 0, e2);
    });
  };
  api2.persist = {
    setOptions: (newOptions) => {
      options = {
        ...options,
        ...newOptions
      };
      if (newOptions.getStorage) {
        storage = newOptions.getStorage();
      }
    },
    clearStorage: () => {
      storage == null ? void 0 : storage.removeItem(options.name);
    },
    getOptions: () => options,
    rehydrate: () => hydrate(),
    hasHydrated: () => hasHydrated,
    onHydrate: (cb) => {
      hydrationListeners.add(cb);
      return () => {
        hydrationListeners.delete(cb);
      };
    },
    onFinishHydration: (cb) => {
      finishHydrationListeners.add(cb);
      return () => {
        finishHydrationListeners.delete(cb);
      };
    }
  };
  hydrate();
  return stateFromStorage || configResult;
};
var newImpl = (config, baseOptions) => (set, get, api2) => {
  let options = {
    storage: createJSONStorage(() => localStorage),
    partialize: (state) => state,
    version: 0,
    merge: (persistedState, currentState) => ({
      ...currentState,
      ...persistedState
    }),
    ...baseOptions
  };
  let hasHydrated = false;
  const hydrationListeners = /* @__PURE__ */ new Set();
  const finishHydrationListeners = /* @__PURE__ */ new Set();
  let storage = options.storage;
  if (!storage) {
    return config(
      (...args) => {
        console.warn(
          `[zustand persist middleware] Unable to update item '${options.name}', the given storage is currently unavailable.`
        );
        set(...args);
      },
      get,
      api2
    );
  }
  const setItem = () => {
    const state = options.partialize({ ...get() });
    return storage.setItem(options.name, {
      state,
      version: options.version
    });
  };
  const savedSetState = api2.setState;
  api2.setState = (state, replace) => {
    savedSetState(state, replace);
    void setItem();
  };
  const configResult = config(
    (...args) => {
      set(...args);
      void setItem();
    },
    get,
    api2
  );
  api2.getInitialState = () => configResult;
  let stateFromStorage;
  const hydrate = () => {
    var _a, _b;
    if (!storage) return;
    hasHydrated = false;
    hydrationListeners.forEach((cb) => {
      var _a2;
      return cb((_a2 = get()) != null ? _a2 : configResult);
    });
    const postRehydrationCallback = ((_b = options.onRehydrateStorage) == null ? void 0 : _b.call(options, (_a = get()) != null ? _a : configResult)) || void 0;
    return toThenable(storage.getItem.bind(storage))(options.name).then((deserializedStorageValue) => {
      if (deserializedStorageValue) {
        if (typeof deserializedStorageValue.version === "number" && deserializedStorageValue.version !== options.version) {
          if (options.migrate) {
            return [
              true,
              options.migrate(
                deserializedStorageValue.state,
                deserializedStorageValue.version
              )
            ];
          }
          console.error(
            `State loaded from storage couldn't be migrated since no migrate function was provided`
          );
        } else {
          return [false, deserializedStorageValue.state];
        }
      }
      return [false, void 0];
    }).then((migrationResult) => {
      var _a2;
      const [migrated, migratedState] = migrationResult;
      stateFromStorage = options.merge(
        migratedState,
        (_a2 = get()) != null ? _a2 : configResult
      );
      set(stateFromStorage, true);
      if (migrated) {
        return setItem();
      }
    }).then(() => {
      postRehydrationCallback == null ? void 0 : postRehydrationCallback(stateFromStorage, void 0);
      stateFromStorage = get();
      hasHydrated = true;
      finishHydrationListeners.forEach((cb) => cb(stateFromStorage));
    }).catch((e2) => {
      postRehydrationCallback == null ? void 0 : postRehydrationCallback(void 0, e2);
    });
  };
  api2.persist = {
    setOptions: (newOptions) => {
      options = {
        ...options,
        ...newOptions
      };
      if (newOptions.storage) {
        storage = newOptions.storage;
      }
    },
    clearStorage: () => {
      storage == null ? void 0 : storage.removeItem(options.name);
    },
    getOptions: () => options,
    rehydrate: () => hydrate(),
    hasHydrated: () => hasHydrated,
    onHydrate: (cb) => {
      hydrationListeners.add(cb);
      return () => {
        hydrationListeners.delete(cb);
      };
    },
    onFinishHydration: (cb) => {
      finishHydrationListeners.add(cb);
      return () => {
        finishHydrationListeners.delete(cb);
      };
    }
  };
  if (!options.skipHydration) {
    hydrate();
  }
  return stateFromStorage || configResult;
};
var persistImpl = (config, baseOptions) => {
  if ("getStorage" in baseOptions || "serialize" in baseOptions || "deserialize" in baseOptions) {
    if ((import.meta.env ? import.meta.env.MODE : void 0) !== "production") {
      console.warn(
        "[DEPRECATED] `getStorage`, `serialize` and `deserialize` options are deprecated. Use `storage` option instead."
      );
    }
    return oldImpl(config, baseOptions);
  }
  return newImpl(config, baseOptions);
};
var persist = persistImpl;

// src/store/index.js
var useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      setAuth: (user, token) => set({ user, token, isAuthenticated: true }),
      logout: () => {
        localStorage.removeItem("token");
        set({ user: null, token: null, isAuthenticated: false });
      }
    }),
    {
      name: "auth-storage"
    }
  )
);
var useFlightStore = create((set) => ({
  flights: [],
  isLoading: false,
  error: null,
  searchParams: null,
  metrics: null,
  setFlights: (flights) => set({ flights, error: null }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error, isLoading: false }),
  setSearchParams: (searchParams) => set({ searchParams }),
  setMetrics: (metrics) => set({ metrics }),
  clearFlights: () => set({ flights: [], error: null, searchParams: null, metrics: null })
}));

// node_modules/react-hot-toast/dist/index.mjs
var import_react3 = __toESM(require_react(), 1);
var import_react4 = __toESM(require_react(), 1);
var y = __toESM(require_react(), 1);

// node_modules/goober/dist/goober.modern.js
var e = { data: "" };
var t = (t2) => {
  if ("object" == typeof window) {
    let e2 = (t2 ? t2.querySelector("#_goober") : window._goober) || Object.assign(document.createElement("style"), { innerHTML: " ", id: "_goober" });
    return e2.nonce = window.__nonce__, e2.parentNode || (t2 || document.head).appendChild(e2), e2.firstChild;
  }
  return t2 || e;
};
var l = /(?:([\u0080-\uFFFF\w-%@]+) *:? *([^{;]+?);|([^;}{]*?) *{)|(}\s*)/g;
var a = /\/\*[^]*?\*\/|  +/g;
var n = /\n+/g;
var o = (e2, t2) => {
  let r = "", l2 = "", a2 = "";
  for (let n3 in e2) {
    let c2 = e2[n3];
    "@" == n3[0] ? "i" == n3[1] ? r = n3 + " " + c2 + ";" : l2 += "f" == n3[1] ? o(c2, n3) : n3 + "{" + o(c2, "k" == n3[1] ? "" : t2) + "}" : "object" == typeof c2 ? l2 += o(c2, t2 ? t2.replace(/([^,])+/g, (e3) => n3.replace(/([^,]*:\S+\([^)]*\))|([^,])+/g, (t3) => /&/.test(t3) ? t3.replace(/&/g, e3) : e3 ? e3 + " " + t3 : t3)) : n3) : null != c2 && (n3 = /^--/.test(n3) ? n3 : n3.replace(/[A-Z]/g, "-$&").toLowerCase(), a2 += o.p ? o.p(n3, c2) : n3 + ":" + c2 + ";");
  }
  return r + (t2 && a2 ? t2 + "{" + a2 + "}" : a2) + l2;
};
var c = {};
var s = (e2) => {
  if ("object" == typeof e2) {
    let t2 = "";
    for (let r in e2) t2 += r + s(e2[r]);
    return t2;
  }
  return e2;
};
var i = (e2, t2, r, i2, p2) => {
  let u2 = s(e2), d2 = c[u2] || (c[u2] = ((e3) => {
    let t3 = 0, r2 = 11;
    for (; t3 < e3.length; ) r2 = 101 * r2 + e3.charCodeAt(t3++) >>> 0;
    return "go" + r2;
  })(u2));
  if (!c[d2]) {
    let t3 = u2 !== e2 ? e2 : ((e3) => {
      let t4, r2, o2 = [{}];
      for (; t4 = l.exec(e3.replace(a, "")); ) t4[4] ? o2.shift() : t4[3] ? (r2 = t4[3].replace(n, " ").trim(), o2.unshift(o2[0][r2] = o2[0][r2] || {})) : o2[0][t4[1]] = t4[2].replace(n, " ").trim();
      return o2[0];
    })(e2);
    c[d2] = o(p2 ? { ["@keyframes " + d2]: t3 } : t3, r ? "" : "." + d2);
  }
  let f3 = r && c.g ? c.g : null;
  return r && (c.g = c[d2]), ((e3, t3, r2, l2) => {
    l2 ? t3.data = t3.data.replace(l2, e3) : -1 === t3.data.indexOf(e3) && (t3.data = r2 ? e3 + t3.data : t3.data + e3);
  })(c[d2], t2, i2, f3), d2;
};
var p = (e2, t2, r) => e2.reduce((e3, l2, a2) => {
  let n3 = t2[a2];
  if (n3 && n3.call) {
    let e4 = n3(r), t3 = e4 && e4.props && e4.props.className || /^go/.test(e4) && e4;
    n3 = t3 ? "." + t3 : e4 && "object" == typeof e4 ? e4.props ? "" : o(e4, "") : false === e4 ? "" : e4;
  }
  return e3 + l2 + (null == n3 ? "" : n3);
}, "");
function u(e2) {
  let r = this || {}, l2 = e2.call ? e2(r.p) : e2;
  return i(l2.unshift ? l2.raw ? p(l2, [].slice.call(arguments, 1), r.p) : l2.reduce((e3, t2) => Object.assign(e3, t2 && t2.call ? t2(r.p) : t2), {}) : l2, t(r.target), r.g, r.o, r.k);
}
var d;
var f;
var g;
var b = u.bind({ g: 1 });
var h = u.bind({ k: 1 });
function m(e2, t2, r, l2) {
  o.p = t2, d = e2, f = r, g = l2;
}
function w(e2, t2) {
  let r = this || {};
  return function() {
    let l2 = arguments;
    function a2(n3, o2) {
      let c2 = Object.assign({}, n3), s2 = c2.className || a2.className;
      r.p = Object.assign({ theme: f && f() }, c2), r.o = / *go\d+/.test(s2), c2.className = u.apply(r, l2) + (s2 ? " " + s2 : ""), t2 && (c2.ref = o2);
      let i2 = e2;
      return e2[0] && (i2 = c2.as || e2, delete c2.as), g && i2[0] && g(c2), d(i2, c2);
    }
    return t2 ? t2(a2) : a2;
  };
}

// node_modules/react-hot-toast/dist/index.mjs
var b2 = __toESM(require_react(), 1);
var x = __toESM(require_react(), 1);
var Z = (e2) => typeof e2 == "function";
var h2 = (e2, t2) => Z(e2) ? e2(t2) : e2;
var W = /* @__PURE__ */ (() => {
  let e2 = 0;
  return () => (++e2).toString();
})();
var E = /* @__PURE__ */ (() => {
  let e2;
  return () => {
    if (e2 === void 0 && typeof window < "u") {
      let t2 = matchMedia("(prefers-reduced-motion: reduce)");
      e2 = !t2 || t2.matches;
    }
    return e2;
  };
})();
var re = 20;
var k = "default";
var H = (e2, t2) => {
  let { toastLimit: o2 } = e2.settings;
  switch (t2.type) {
    case 0:
      return { ...e2, toasts: [t2.toast, ...e2.toasts].slice(0, o2) };
    case 1:
      return { ...e2, toasts: e2.toasts.map((r) => r.id === t2.toast.id ? { ...r, ...t2.toast } : r) };
    case 2:
      let { toast: s2 } = t2;
      return H(e2, { type: e2.toasts.find((r) => r.id === s2.id) ? 1 : 0, toast: s2 });
    case 3:
      let { toastId: a2 } = t2;
      return { ...e2, toasts: e2.toasts.map((r) => r.id === a2 || a2 === void 0 ? { ...r, dismissed: true, visible: false } : r) };
    case 4:
      return t2.toastId === void 0 ? { ...e2, toasts: [] } : { ...e2, toasts: e2.toasts.filter((r) => r.id !== t2.toastId) };
    case 5:
      return { ...e2, pausedAt: t2.time };
    case 6:
      let i2 = t2.time - (e2.pausedAt || 0);
      return { ...e2, pausedAt: void 0, toasts: e2.toasts.map((r) => ({ ...r, pauseDuration: r.pauseDuration + i2 })) };
  }
};
var v = [];
var j = { toasts: [], pausedAt: void 0, settings: { toastLimit: re } };
var f2 = {};
var Y = (e2, t2 = k) => {
  f2[t2] = H(f2[t2] || j, e2), v.forEach(([o2, s2]) => {
    o2 === t2 && s2(f2[t2]);
  });
};
var _ = (e2) => Object.keys(f2).forEach((t2) => Y(e2, t2));
var Q = (e2) => Object.keys(f2).find((t2) => f2[t2].toasts.some((o2) => o2.id === e2));
var S = (e2 = k) => (t2) => {
  Y(t2, e2);
};
var se = { blank: 4e3, error: 4e3, success: 2e3, loading: 1 / 0, custom: 4e3 };
var ie = (e2, t2 = "blank", o2) => ({ createdAt: Date.now(), visible: true, dismissed: false, type: t2, ariaProps: { role: "status", "aria-live": "polite" }, message: e2, pauseDuration: 0, ...o2, id: (o2 == null ? void 0 : o2.id) || W() });
var P = (e2) => (t2, o2) => {
  let s2 = ie(t2, e2, o2);
  return S(s2.toasterId || Q(s2.id))({ type: 2, toast: s2 }), s2.id;
};
var n2 = (e2, t2) => P("blank")(e2, t2);
n2.error = P("error");
n2.success = P("success");
n2.loading = P("loading");
n2.custom = P("custom");
n2.dismiss = (e2, t2) => {
  let o2 = { type: 3, toastId: e2 };
  t2 ? S(t2)(o2) : _(o2);
};
n2.dismissAll = (e2) => n2.dismiss(void 0, e2);
n2.remove = (e2, t2) => {
  let o2 = { type: 4, toastId: e2 };
  t2 ? S(t2)(o2) : _(o2);
};
n2.removeAll = (e2) => n2.remove(void 0, e2);
n2.promise = (e2, t2, o2) => {
  let s2 = n2.loading(t2.loading, { ...o2, ...o2 == null ? void 0 : o2.loading });
  return typeof e2 == "function" && (e2 = e2()), e2.then((a2) => {
    let i2 = t2.success ? h2(t2.success, a2) : void 0;
    return i2 ? n2.success(i2, { id: s2, ...o2, ...o2 == null ? void 0 : o2.success }) : n2.dismiss(s2), a2;
  }).catch((a2) => {
    let i2 = t2.error ? h2(t2.error, a2) : void 0;
    i2 ? n2.error(i2, { id: s2, ...o2, ...o2 == null ? void 0 : o2.error }) : n2.dismiss(s2);
  }), e2;
};
var de = h`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
 transform: scale(1) rotate(45deg);
  opacity: 1;
}`;
var me = h`
from {
  transform: scale(0);
  opacity: 0;
}
to {
  transform: scale(1);
  opacity: 1;
}`;
var le = h`
from {
  transform: scale(0) rotate(90deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(90deg);
	opacity: 1;
}`;
var C = w("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${(e2) => e2.primary || "#ff4b4b"};
  position: relative;
  transform: rotate(45deg);

  animation: ${de} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;

  &:after,
  &:before {
    content: '';
    animation: ${me} 0.15s ease-out forwards;
    animation-delay: 150ms;
    position: absolute;
    border-radius: 3px;
    opacity: 0;
    background: ${(e2) => e2.secondary || "#fff"};
    bottom: 9px;
    left: 4px;
    height: 2px;
    width: 12px;
  }

  &:before {
    animation: ${le} 0.15s ease-out forwards;
    animation-delay: 180ms;
    transform: rotate(90deg);
  }
`;
var Te = h`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;
var F = w("div")`
  width: 12px;
  height: 12px;
  box-sizing: border-box;
  border: 2px solid;
  border-radius: 100%;
  border-color: ${(e2) => e2.secondary || "#e0e0e0"};
  border-right-color: ${(e2) => e2.primary || "#616161"};
  animation: ${Te} 1s linear infinite;
`;
var ge = h`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(45deg);
	opacity: 1;
}`;
var he = h`
0% {
	height: 0;
	width: 0;
	opacity: 0;
}
40% {
  height: 0;
	width: 6px;
	opacity: 1;
}
100% {
  opacity: 1;
  height: 10px;
}`;
var L = w("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${(e2) => e2.primary || "#61d345"};
  position: relative;
  transform: rotate(45deg);

  animation: ${ge} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;
  &:after {
    content: '';
    box-sizing: border-box;
    animation: ${he} 0.2s ease-out forwards;
    opacity: 0;
    animation-delay: 200ms;
    position: absolute;
    border-right: 2px solid;
    border-bottom: 2px solid;
    border-color: ${(e2) => e2.secondary || "#fff"};
    bottom: 6px;
    left: 6px;
    height: 10px;
    width: 6px;
  }
`;
var be = w("div")`
  position: absolute;
`;
var Se = w("div")`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 20px;
  min-height: 20px;
`;
var Ae = h`
from {
  transform: scale(0.6);
  opacity: 0.4;
}
to {
  transform: scale(1);
  opacity: 1;
}`;
var Pe = w("div")`
  position: relative;
  transform: scale(0.6);
  opacity: 0.4;
  min-width: 20px;
  animation: ${Ae} 0.3s 0.12s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
`;
var $ = ({ toast: e2 }) => {
  let { icon: t2, type: o2, iconTheme: s2 } = e2;
  return t2 !== void 0 ? typeof t2 == "string" ? b2.createElement(Pe, null, t2) : t2 : o2 === "blank" ? null : b2.createElement(Se, null, b2.createElement(F, { ...s2 }), o2 !== "loading" && b2.createElement(be, null, o2 === "error" ? b2.createElement(C, { ...s2 }) : b2.createElement(L, { ...s2 })));
};
var Re = (e2) => `
0% {transform: translate3d(0,${e2 * -200}%,0) scale(.6); opacity:.5;}
100% {transform: translate3d(0,0,0) scale(1); opacity:1;}
`;
var Ee = (e2) => `
0% {transform: translate3d(0,0,-1px) scale(1); opacity:1;}
100% {transform: translate3d(0,${e2 * -150}%,-1px) scale(.6); opacity:0;}
`;
var ve = "0%{opacity:0;} 100%{opacity:1;}";
var De = "0%{opacity:1;} 100%{opacity:0;}";
var Oe = w("div")`
  display: flex;
  align-items: center;
  background: #fff;
  color: #363636;
  line-height: 1.3;
  will-change: transform;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1), 0 3px 3px rgba(0, 0, 0, 0.05);
  max-width: 350px;
  pointer-events: auto;
  padding: 8px 10px;
  border-radius: 8px;
`;
var Ie = w("div")`
  display: flex;
  justify-content: center;
  margin: 4px 10px;
  color: inherit;
  flex: 1 1 auto;
  white-space: pre-line;
`;
var ke = (e2, t2) => {
  let s2 = e2.includes("top") ? 1 : -1, [a2, i2] = E() ? [ve, De] : [Re(s2), Ee(s2)];
  return { animation: t2 ? `${h(a2)} 0.35s cubic-bezier(.21,1.02,.73,1) forwards` : `${h(i2)} 0.4s forwards cubic-bezier(.06,.71,.55,1)` };
};
var N = y.memo(({ toast: e2, position: t2, style: o2, children: s2 }) => {
  let a2 = e2.height ? ke(e2.position || t2 || "top-center", e2.visible) : { opacity: 0 }, i2 = y.createElement($, { toast: e2 }), r = y.createElement(Ie, { ...e2.ariaProps }, h2(e2.message, e2));
  return y.createElement(Oe, { className: e2.className, style: { ...a2, ...o2, ...e2.style } }, typeof s2 == "function" ? s2({ icon: i2, message: r }) : y.createElement(y.Fragment, null, i2, r));
});
m(x.createElement);
var Ce = u`
  z-index: 9999;
  > * {
    pointer-events: auto;
  }
`;
var zt = n2;

// src/components/SearchForm.jsx
function SearchForm() {
  const setFlights = useFlightStore((state) => state.setFlights);
  const setStoreMetrics = useFlightStore((state) => state.setMetrics);
  const [searchParams, setSearchParams] = (0, import_react5.useState)(null);
  const [error, setError] = (0, import_react5.useState)(null);
  const [loading, setLoading] = (0, import_react5.useState)(false);
  const [stayDaysMax, setStayDaysMax] = (0, import_react5.useState)(7);
  const [stayDaysMin, setStayDaysMin] = (0, import_react5.useState)(1);
  const [departureFrom, setDepartureFrom] = (0, import_react5.useState)("00:00");
  const [departureTo, setDepartureTo] = (0, import_react5.useState)("23:59");
  const [returnArrivalFrom, setReturnArrivalFrom] = (0, import_react5.useState)("00:00");
  const [arrivalFrom, setArrivalFrom] = (0, import_react5.useState)("00:00");
  const [arrivalTo, setArrivalTo] = (0, import_react5.useState)("23:59");
  const [returnArrivalTo, setReturnArrivalTo] = (0, import_react5.useState)("23:59");
  const [arrivalFromMin, setArrivalFromMin] = (0, import_react5.useState)(0);
  const [arrivalToMin, setArrivalToMin] = (0, import_react5.useState)(23 * 60 + 59);
  const [departureFromMin, setDepartureFromMin] = (0, import_react5.useState)(0);
  const [returnDepartureFrom, setReturnDepartureFrom] = (0, import_react5.useState)("00:00");
  const [returnDepartureTo, setReturnDepartureTo] = (0, import_react5.useState)("23:59");
  const [departureToMin, setDepartureToMin] = (0, import_react5.useState)(23 * 60 + 59);
  const [returnArrivalFromMin, setReturnArrivalFromMin] = (0, import_react5.useState)(0);
  const [returnDepartureFromMin, setReturnDepartureFromMin] = (0, import_react5.useState)(0);
  const [returnDepartureToMin, setReturnDepartureToMin] = (0, import_react5.useState)(23 * 60 + 59);
  const [returnArrivalToMin, setReturnArrivalToMin] = (0, import_react5.useState)(23 * 60 + 59);
  (0, import_react5.useEffect)(() => {
    const df = timeToMinutes(departureFrom);
    const dt = timeToMinutes(departureTo);
    const rf = timeToMinutes(returnArrivalFrom);
    const rt = timeToMinutes(returnArrivalTo);
    if (departureFromMin !== df) setDepartureFromMin(df);
    const af = timeToMinutes(arrivalFrom);
    const at = timeToMinutes(arrivalTo);
    if (arrivalFromMin !== af) setArrivalFromMin(af);
    if (arrivalToMin !== at) setArrivalToMin(at);
    if (departureToMin !== dt) setDepartureToMin(dt);
    if (returnArrivalFromMin !== rf) setReturnArrivalFromMin(rf);
    if (returnArrivalToMin !== rt) setReturnArrivalToMin(rt);
  }, [departureFrom, departureTo, returnArrivalFrom, returnArrivalTo]);
  (0, import_react5.useEffect)(() => {
    const dfStr = minutesToTime(departureFromMin);
    const dtStr = minutesToTime(departureToMin);
    const rfStr = minutesToTime(returnArrivalFromMin);
    const afStr = minutesToTime(arrivalFromMin);
    const atStr = minutesToTime(arrivalToMin);
    if (arrivalFrom !== afStr) setArrivalFrom(afStr);
    if (arrivalTo !== atStr) setArrivalTo(atStr);
    const rtStr = minutesToTime(returnArrivalToMin);
    if (departureFrom !== dfStr) setDepartureFrom(dfStr);
    const rdf = timeToMinutes(returnDepartureFrom);
    const rdt = timeToMinutes(returnDepartureTo);
    if (returnDepartureFromMin !== rdf) setReturnDepartureFromMin(rdf);
    if (returnDepartureToMin !== rdt) setReturnDepartureToMin(rdt);
    if (departureTo !== dtStr) setDepartureTo(dtStr);
    if (returnArrivalFrom !== rfStr) setReturnArrivalFrom(rfStr);
    if (returnArrivalTo !== rtStr) setReturnArrivalTo(rtStr);
  }, [departureFromMin, departureToMin, returnArrivalFromMin, returnArrivalToMin, arrivalFromMin, arrivalToMin]);
  function rangeTrackStyle(minVal, maxVal) {
    const minPct = minVal / 1439 * 100;
    const maxPct = maxVal / 1439 * 100;
    const color = "#2563EB";
    const bg = `linear-gradient(90deg, #E5E7EB ${minPct}%, ${color} ${minPct}%, ${color} ${maxPct}%, #E5E7EB ${maxPct}%)`;
    return { background: bg };
  }
  const [departureDays, setDepartureDays] = (0, import_react5.useState)([true, true, true, true, true, true, true]);
  const [returnDays, setReturnDays] = (0, import_react5.useState)([true, true, true, true, true, true, true]);
  const [departureDayStart, setDepartureDayStart] = (0, import_react5.useState)(0);
  const [departureDayEnd, setDepartureDayEnd] = (0, import_react5.useState)(6);
  const [returnDayStart, setReturnDayStart] = (0, import_react5.useState)(0);
  const [returnDayEnd, setReturnDayEnd] = (0, import_react5.useState)(6);
  const [metrics, setMetrics] = (0, import_react5.useState)(null);
  const isAuthenticated = true;
  const [returnFrom, setReturnFrom] = (0, import_react5.useState)("");
  const [isSubmitting, setIsSubmitting] = (0, import_react5.useState)(false);
  const [adults, setAdults] = (0, import_react5.useState)(1);
  const [maxPrice, setMaxPrice] = (0, import_react5.useState)("");
  const [aggressiveMode, setAggressiveMode] = (0, import_react5.useState)(false);
  const [debugOutDate, setDebugOutDate] = (0, import_react5.useState)("");
  const [debugInDate, setDebugInDate] = (0, import_react5.useState)("");
  const [debugReturnAirport, setDebugReturnAirport] = (0, import_react5.useState)("");
  const [tripType, setTripType] = (0, import_react5.useState)("oneway");
  const [dateFrom, setDateFrom] = (0, import_react5.useState)("");
  const [dateTo, setDateTo] = (0, import_react5.useState)("");
  const [allAirports, setAllAirports] = (0, import_react5.useState)([]);
  const [airportsLoading, setAirportsLoading] = (0, import_react5.useState)(true);
  const [groupedAirports, setGroupedAirports] = (0, import_react5.useState)({});
  const [origin2, setOrigin] = (0, import_react5.useState)("");
  const [destination, setDestination] = (0, import_react5.useState)("");
  const [availableDestinations, setAvailableDestinations] = (0, import_react5.useState)([]);
  const [loadingDestinations, setLoadingDestinations] = (0, import_react5.useState)(false);
  const [searchFromCountry, setSearchFromCountry] = (0, import_react5.useState)(false);
  const [originCountry, setOriginCountry] = (0, import_react5.useState)("");
  const [differentReturnAirport, setDifferentReturnAirport] = (0, import_react5.useState)(true);
  (0, import_react5.useEffect)(() => {
    if (tripType === "round" && !differentReturnAirport) {
      setDifferentReturnAirport(true);
    }
  }, [tripType]);
  const [countryAvailableDestinations, setCountryAvailableDestinations] = (0, import_react5.useState)([]);
  const [countryRoutesByAirport, setCountryRoutesByAirport] = (0, import_react5.useState)({});
  const [countryMonthlyFaresByAirport, setCountryMonthlyFaresByAirport] = (0, import_react5.useState)({});
  const [searchProgress, setSearchProgress] = (0, import_react5.useState)({ current: 0, total: 0, currentAirport: "" });
  const [cancelSearch, setCancelSearch] = (0, import_react5.useState)(false);
  const [showOriginDropdown, setShowOriginDropdown] = (0, import_react5.useState)(false);
  const [showDestDropdown, setShowDestDropdown] = (0, import_react5.useState)(false);
  const [originSearch, setOriginSearch] = (0, import_react5.useState)("");
  const [destSearch, setDestSearch] = (0, import_react5.useState)("");
  (0, import_react5.useEffect)(() => {
    async function loadAirports() {
      try {
        const airports = await getAllAirports();
        setAllAirports(airports);
        const grouped = groupAirportsByCountry(airports);
        setGroupedAirports(grouped);
        console.log(`\u2705 Za\u0142adowano ${airports.length} lotnisk z ${Object.keys(grouped).length} kraj\xF3w`);
      } catch (error2) {
        console.error("\u274C B\u0142\u0105d \u0142adowania lotnisk:", error2);
        zt.error("Nie uda\u0142o si\u0119 za\u0142adowa\u0107 listy lotnisk");
      } finally {
        setAirportsLoading(false);
      }
    }
    loadAirports();
  }, []);
  function daysRangeToArray(start, end) {
    const arr = [false, false, false, false, false, false, false];
    if (start == null || end == null) return arr;
    let i2 = start;
    while (true) {
      arr[i2] = true;
      if (i2 === end) break;
      i2 = (i2 + 1) % 7;
    }
    return arr;
  }
  (0, import_react5.useEffect)(() => {
    setDepartureDays(daysRangeToArray(departureDayStart, departureDayEnd));
  }, [departureDayStart, departureDayEnd]);
  (0, import_react5.useEffect)(() => {
    setReturnDays(daysRangeToArray(returnDayStart, returnDayEnd));
  }, [returnDayStart, returnDayEnd]);
  function detectContiguousRange(daysArray) {
    const idxs = daysArray.map((v2, idx) => v2 ? idx : -1).filter((i2) => i2 >= 0);
    if (idxs.length === 0) return { start: 0, end: 6 };
    const start = idxs[0];
    const end = idxs[idxs.length - 1];
    if (end - start + 1 === idxs.length) {
      return { start, end };
    }
    const doubled = [...idxs, ...idxs.map((i2) => i2 + 7)];
    for (let i2 = 0; i2 <= doubled.length - idxs.length; i2++) {
      const s2 = doubled[i2];
      const e2 = doubled[i2 + idxs.length - 1];
      if (e2 - s2 + 1 === idxs.length) {
        return { start: s2 % 7, end: e2 % 7 };
      }
    }
    return { start, end };
  }
  (0, import_react5.useEffect)(() => {
    const r = detectContiguousRange(departureDays);
    setDepartureDayStart(r.start);
    setDepartureDayEnd(r.end);
  }, [departureDays]);
  (0, import_react5.useEffect)(() => {
    const r = detectContiguousRange(returnDays);
    setReturnDayStart(r.start);
    setReturnDayEnd(r.end);
  }, [returnDays]);
  (0, import_react5.useEffect)(() => {
    function handleClickOutside(event) {
      if (!event.target.closest(".airport-dropdown")) {
        setShowOriginDropdown(false);
        setShowDestDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  (0, import_react5.useEffect)(() => {
    async function loadAvailableDestinations() {
      if (!origin2 || origin2.length !== 3) {
        setAvailableDestinations([]);
        return;
      }
      setLoadingDestinations(true);
      setDestination("");
      try {
        const filtered = await getFilteredDestinations(origin2, allAirports);
        setAvailableDestinations(filtered);
        if (filtered.length === 0) {
          zt.error(`Brak dost\u0119pnych po\u0142\u0105cze\u0144 z ${origin2}`);
        } else {
          console.log(`\u2705 Dost\u0119pne cele z ${origin2}: ${filtered.length} lotnisk`);
        }
      } catch (error2) {
        console.error("\u274C B\u0142\u0105d pobierania dost\u0119pnych cel\xF3w:", error2);
        zt.error("Nie uda\u0142o si\u0119 pobra\u0107 dost\u0119pnych po\u0142\u0105cze\u0144");
        setAvailableDestinations([]);
      } finally {
        setLoadingDestinations(false);
      }
    }
    loadAvailableDestinations();
  }, [origin2, allAirports]);
  (0, import_react5.useEffect)(() => {
    async function loadCountryDestinations() {
      if (!searchFromCountry || !originCountry || allAirports.length === 0) {
        setCountryAvailableDestinations([]);
        return;
      }
      setLoadingDestinations(true);
      console.log(`\u{1F50D} \u0141aduj\u0119 dost\u0119pne cele z wszystkich lotnisk w kraju ${originCountry}...`);
      try {
        const countryAirports2 = allAirports.filter((a2) => a2.country.code === originCountry);
        const allRoutesPromises = countryAirports2.map((airport) => getRoutesFromAirport(airport.code));
        const allRoutesArrays = await Promise.all(allRoutesPromises);
        const uniqueDestinations = /* @__PURE__ */ new Set();
        allRoutesArrays.forEach((routes) => {
          routes.forEach((code) => uniqueDestinations.add(code));
        });
        const destinationAirports = allAirports.filter((a2) => uniqueDestinations.has(a2.code));
        console.log(`\u2705 Znaleziono ${destinationAirports.length} unikalnych cel\xF3w z kraju ${originCountry}`);
        const routesMap = {};
        for (let i2 = 0; i2 < countryAirports2.length; i2++) {
          routesMap[countryAirports2[i2].code] = allRoutesArrays[i2] || [];
        }
        setCountryRoutesByAirport(routesMap);
        setCountryAvailableDestinations(destinationAirports);
      } catch (error2) {
        console.error("\u274C B\u0142\u0105d pobierania dost\u0119pnych cel\xF3w z kraju:", error2);
        setCountryAvailableDestinations([]);
        setCountryRoutesByAirport({});
        setCountryMonthlyFaresByAirport({});
      } finally {
        setLoadingDestinations(false);
      }
    }
    loadCountryDestinations();
  }, [searchFromCountry, originCountry, allAirports]);
  (0, import_react5.useEffect)(() => {
    async function prefetchMonthlyFares() {
      if (!searchFromCountry || !originCountry || !destination) return;
      if (!maxPrice) return;
      const countryAirports2 = allAirports.filter((a2) => a2.country.code === originCountry);
      const map = {};
      const concurrency = 6;
      const queue = [...countryAirports2];
      const workers = [];
      for (let i2 = 0; i2 < concurrency; i2++) {
        workers.push((async () => {
          while (queue.length > 0) {
            const airport = queue.shift();
            try {
              const originCode = airport.code;
              if (countryRoutesByAirport && countryRoutesByAirport[originCode] && !countryRoutesByAirport[originCode].includes(destination.toUpperCase())) {
                continue;
              }
              const monthly = await getMonthlyFaresForRoute({ origin: originCode, destination, dateFrom, dateTo, adults, departureFrom, departureTo, arrivalFrom, arrivalTo, outboundDays: departureDays });
              map[originCode] = monthly && monthly.prices ? monthly.prices : monthly || /* @__PURE__ */ new Map();
            } catch (e2) {
              console.warn("\u26A0\uFE0F Prefetch monthly fares error for", airport.code, e2?.message || e2);
            }
          }
        })());
      }
      await Promise.all(workers);
      setCountryMonthlyFaresByAirport(map);
    }
    prefetchMonthlyFares();
  }, [searchFromCountry, originCountry, destination, dateFrom, dateTo, allAirports, countryRoutesByAirport, adults]);
  const getMaxStayDays = () => {
    if (!dateFrom || !dateTo) return 30;
    const from = new Date(dateFrom);
    const to = new Date(dateTo);
    const diffTime = to - from;
    const diffDays = Math.ceil(diffTime / (1e3 * 60 * 60 * 24));
    return Math.max(1, diffDays + 1);
  };
  const maxStayDays = getMaxStayDays();
  const handleSearch = async (e2) => {
    e2.preventDefault();
    if (isRyanairBlocked()) {
      setError("Ryanair zablokowa\u0142 ruch API. Zresetuj router i spr\xF3buj ponownie, a nast\u0119pnie u\u017Cyj przycisku Odblokuj.");
      zt.error("\u{1F6D1} Wykryto blokad\u0119 Ryanair. Zresetuj router (zmie\u0144 IP), a potem kliknij Odblokuj w aplikacji.");
      return;
    }
    console.log("\u{1F50D} handleSearch wywo\u0142ane:", {
      searchFromCountry,
      originCountry,
      origin: origin2,
      destination,
      dateFrom,
      dateTo
    });
    if (searchFromCountry) {
      if (!originCountry || !destination || !dateFrom || !dateTo) {
        console.log("\u274C Walidacja nie przesz\u0142a (kraj):", { originCountry, destination, dateFrom, dateTo });
        zt.error("Wype\u0142nij wszystkie pola (kraj, cel, daty)");
        return;
      }
      console.log("\u2705 Walidacja OK (kraj)");
    } else {
      if (!origin2 || !destination || !dateFrom || !dateTo) {
        console.log("\u274C Walidacja nie przesz\u0142a:", { origin: origin2, destination, dateFrom, dateTo });
        zt.error("Wype\u0142nij wszystkie pola");
        return;
      }
      console.log("\u2705 Walidacja OK (lotnisko)");
    }
    if (isSubmitting) {
      console.log("Wyszukiwanie ju\u017C w toku \u2013 ignoruj\u0119 podw\xF3jne klikni\u0119cie");
      return;
    }
    setIsSubmitting(true);
    setLoading(true);
    setError(null);
    try {
      let flights = [];
      let allFlightsFromCountry = [];
      const searchParamsForHistory = {
        origin: searchFromCountry ? originCountry.toUpperCase() + ":COUNTRY" : origin2.toUpperCase(),
        destination: destination.toUpperCase(),
        dateFrom,
        dateTo,
        tripType,
        adults
      };
      setSearchParams(searchParamsForHistory);
      const airportNameByCode = {};
      allAirports.forEach((a2) => {
        airportNameByCode[a2.code] = a2.name;
      });
      if (searchFromCountry && originCountry) {
        console.log("\u{1F30D} Wyszukiwanie z kraju:", originCountry);
        const countryAirports2 = allAirports.filter((a2) => a2.country.code === originCountry);
        console.log("\u{1F3D9}\uFE0F Lotniska w kraju:", countryAirports2.length, countryAirports2.map((a2) => a2.code));
        setSearchProgress({ current: 0, total: countryAirports2.length, currentAirport: "" });
        let allResults = [];
        for (let i2 = 0; i2 < countryAirports2.length; i2++) {
          const airport = countryAirports2[i2];
          console.log(`\u{1F50D} Wyszukiwanie z ${airport.code} (${airport.name})`);
          setSearchProgress({ current: i2 + 1, total: countryAirports2.length, currentAirport: airport.code });
          if (cancelSearch) break;
          const routesForThisAirport = countryRoutesByAirport && countryRoutesByAirport[airport.code] ? countryRoutesByAirport[airport.code] : null;
          if (routesForThisAirport && !routesForThisAirport.includes(destination.toUpperCase())) {
            console.log(`   \u26A0\uFE0F ${airport.code} nie ma po\u0142\u0105czenia do ${destination}, pomijam.`);
            continue;
          }
          if (maxPrice && countryMonthlyFaresByAirport && countryMonthlyFaresByAirport[airport.code]) {
            try {
              const priceMap = countryMonthlyFaresByAirport[airport.code];
              let foundCheap = false;
              if (priceMap instanceof Map) {
                for (const val of priceMap.values()) {
                  if (val <= Number(maxPrice)) {
                    foundCheap = true;
                    break;
                  }
                }
              } else if (typeof priceMap === "object") {
                for (const k2 in priceMap) {
                  if (Object.prototype.hasOwnProperty.call(priceMap, k2) && priceMap[k2] <= Number(maxPrice)) {
                    foundCheap = true;
                    break;
                  }
                }
              }
              if (!foundCheap) {
                console.log(`   \u26A0\uFE0F ${airport.code} nie ma dni \u2264 ${maxPrice} PLN wed\u0142ug miesi\u0119cznych cen, pomijam.`);
                continue;
              }
            } catch (e3) {
              console.warn("   \u26A0\uFE0F B\u0142\u0105d analizowania monthly fares:", e3?.message || e3);
            }
          }
          try {
            if (tripType === "oneway") {
              const combos = await searchAnyDestination({
                origin: airport.code,
                dateFrom,
                dateTo,
                adults,
                market: "pl-pl",
                departureFrom,
                departureTo
              }, maxPrice ? Number(maxPrice) : null);
              combos.forEach((c2) => {
                if (Array.isArray(c2.flights)) {
                  c2.flights.forEach((flight) => {
                    if (flight.originAirport && flight.originAirport !== airport.code) {
                      console.warn(`   \u26A0\uFE0F Pomini\u0119to lot z innego lotniska (${flight.originAirport}) zamiast ${airport.code}`);
                      return;
                    }
                    allResults.push({
                      originAirport: airport.code,
                      originName: airport.name,
                      destination: c2.destination,
                      destinationName: c2.destinationName,
                      date: flight.date,
                      price: flight.price,
                      currency: flight.currency,
                      priceInPLN: flight.priceInPLN || null,
                      source: flight.source || "CACHE"
                    });
                  });
                }
              });
            } else {
              const combos = await searchRoundTripRange({
                origin: airport.code,
                destination: destination.toUpperCase(),
                outFrom: dateFrom,
                outTo: dateTo,
                stayDaysMin,
                stayDaysMax,
                maxPrice: maxPrice ? Number(maxPrice) : null,
                adults,
                allowDifferentReturnAirport: differentReturnAirport,
                availableReturnAirports: differentReturnAirport ? countryAirports2.map((a2) => a2.code) : null,
                oneWayCandidateMargin: aggressiveMode ? 1.5 : 1.3,
                departureFrom,
                departureTo,
                arrivalFrom,
                arrivalTo,
                returnArrivalFrom,
                returnArrivalTo,
                returnDepartureFrom,
                returnDepartureTo,
                departureDays,
                returnDays
              });
              combos.forEach((c2) => {
                if (!c2.outbound || !c2.inbound) return;
                if (!c2.outbound.date || !c2.outbound.departure || !c2.inbound.date || !c2.inbound.departure) return;
                if (!c2.totalPriceInPLN) return;
                c2.originAirport = airport.code;
                c2.originName = airport.name;
                if (!c2.returnAirport && c2.inbound && c2.inbound.destination) {
                  c2.returnAirport = c2.inbound.destination;
                }
                if ((!c2.returnName || c2.returnName === "") && c2.returnAirport) {
                  c2.returnName = airportNameByCode[c2.returnAirport] || c2.returnAirport || c2.inbound && c2.inbound.destinationName || "";
                }
                c2.source = c2.source || (c2.outbound?.source === "API" && c2.inbound?.source === "API" ? "API" : c2.outbound?.source === "CACHE" && c2.inbound?.source === "CACHE" ? "CACHE" : "MIXED");
                allResults.push(c2);
              });
            }
          } catch (err) {
            console.error(`B\u0142\u0105d wyszukiwania z ${airport.code}:`, err);
          }
        }
        if (tripType === "oneway") {
          console.log("\u{1F4CA} \u0141\u0105cznie zebrano (one-way):", allResults.length, "lot\xF3w");
          flights = allResults.sort((a2, b3) => (a2.priceInPLN || a2.price || Infinity) - (b3.priceInPLN || b3.price || Infinity));
          setFlights(flights);
        } else {
          console.log("\u{1F4CA} \u0141\u0105cznie zebrano (round-trip):", allResults.length, "kombinacji");
          flights = allResults.sort((a2, b3) => (a2.totalPriceInPLN || Infinity) - (b3.totalPriceInPLN || Infinity));
          setFlights(flights);
        }
        setSearchProgress({ current: countryAirports2.length, total: countryAirports2.length, currentAirport: "" });
        const metrics2 = getLastMetrics();
        setStoreMetrics(metrics2);
      } else {
        if (tripType === "oneway") {
          flights = await searchFlightsRange({
            origin: origin2.toUpperCase(),
            destination: destination.toUpperCase(),
            dateFrom,
            dateTo,
            adults,
            maxPrice: maxPrice ? Number(maxPrice) : null,
            departureFrom,
            departureTo,
            arrivalFrom,
            arrivalTo,
            departureDays
          });
          setFlights(flights);
          const metrics2 = getLastMetrics();
          setStoreMetrics(metrics2);
        } else {
          const combinations = await searchRoundTripRange({
            origin: origin2.toUpperCase(),
            destination: destination.toUpperCase(),
            outFrom: dateFrom,
            outTo: dateTo,
            stayDaysMin,
            stayDaysMax,
            maxPrice: maxPrice ? Number(maxPrice) : null,
            // opcjonalny filtr ceny
            adults,
            allowDifferentReturnAirport: differentReturnAirport,
            availableReturnAirports: differentReturnAirport && searchFromCountry ? countryAirports.map((a2) => a2.code) : null,
            oneWayCandidateMargin: aggressiveMode ? 1.5 : 1.3,
            departureFrom,
            departureTo,
            arrivalFrom,
            arrivalTo,
            returnArrivalFrom,
            returnArrivalTo,
            returnDepartureFrom,
            returnDepartureTo,
            departureDays,
            returnDays
          });
          combinations.forEach((c2) => {
            if (!c2.returnAirport && c2.inbound && c2.inbound.destination) {
              c2.returnAirport = c2.inbound.destination;
            }
            if ((!c2.returnName || c2.returnName === "") && c2.returnAirport) {
              c2.returnName = airportNameByCode[c2.returnAirport] || c2.returnAirport;
            }
            c2.source = c2.source || (c2.outbound?.source === "API" && c2.inbound?.source === "API" ? "API" : c2.outbound?.source === "CACHE" && c2.inbound?.source === "CACHE" ? "CACHE" : "MIXED");
          });
          setFlights(combinations);
          const metrics2 = getLastMetrics();
          setStoreMetrics(metrics2);
          flights = combinations;
        }
      }
      const prices = tripType === "round" ? flights.filter((f3) => f3.totalPriceInPLN != null).map((f3) => f3.totalPriceInPLN) : flights.filter((f3) => f3.price != null).map((f3) => f3.price);
      const stats = prices.length > 0 ? {
        flights_found: flights.length,
        min_price: Math.min(...prices),
        max_price: Math.max(...prices),
        avg_price: prices.reduce((a2, b3) => a2 + b3, 0) / prices.length
      } : {
        flights_found: 0,
        min_price: null,
        max_price: null,
        avg_price: null
      };
      if (isAuthenticated) {
      }
      if (flights.length === 0) {
        zt.error("Brak lot\xF3w na tej trasie");
      } else {
        zt.success(`Znaleziono ${flights.length} lot\xF3w!`);
      }
    } catch (error2) {
      console.error("B\u0142\u0105d wyszukiwania:", error2);
      setError(error2.message);
      if (error2.message.includes("zablokowa\u0142")) {
        zt.error(error2.message, { duration: 6e3 });
      } else if (error2.message.includes("Backend")) {
        zt.error(error2.message, { duration: 5e3 });
      } else {
        zt.error("B\u0142\u0105d wyszukiwania lot\xF3w");
      }
    } finally {
      setLoading(false);
      setIsSubmitting(false);
    }
  };
  const handleDebugPairClick = async () => {
    const originCode = searchFromCountry && originCountry ? originCountry : origin2;
    const defOut = debugOutDate || dateFrom;
    const defIn = debugInDate || dateTo;
    const defReturn = debugReturnAirport || (differentReturnAirport ? "" : destination);
    const outDate = prompt("Out date (YYYY-MM-DD):", defOut);
    if (!outDate) return;
    const inDate = prompt("In date (YYYY-MM-DD):", defIn);
    if (!inDate) return;
    const returnAirport = prompt("Return airport IATA (e.g. WAW):", defReturn || "WAW");
    if (!returnAirport) return;
    try {
      console.log("\u{1F527} Debug pair:", { origin: originCode, destination, outDate, inDate, returnAirport });
      const res = await debugCheckPair({ origin: originCode, destination: destination.toUpperCase(), outDate, inDate, returnAirport: returnAirport.toUpperCase(), adults });
      console.log("\u{1F50D} Debug result:", res);
      zt.success(`Debug finished: ${res.accepted.length} accepted, ${res.rejected.length} rejected. Sprawd\u017A konsol\u0119.`);
    } catch (err) {
      console.error("B\u0142\u0105d debugCheckPair:", err);
      zt.error(`B\u0142\u0105d debugCheckPair: ${err?.message || err}`);
    }
  };
  return /* @__PURE__ */ import_react5.default.createElement("div", { className: "bg-white rounded-lg shadow-lg p-6" }, /* @__PURE__ */ import_react5.default.createElement("h2", { className: "text-2xl font-bold mb-6 flex items-center gap-2" }, /* @__PURE__ */ import_react5.default.createElement(Plane, { className: "w-6 h-6 text-blue-600" }), "Wyszukaj Loty"), /* @__PURE__ */ import_react5.default.createElement("form", { onSubmit: handleSearch, className: "space-y-4" }, /* @__PURE__ */ import_react5.default.createElement("div", { className: "bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3" }, /* @__PURE__ */ import_react5.default.createElement("h3", { className: "text-sm font-semibold text-blue-900 mb-2" }, "Opcje wyszukiwania"), /* @__PURE__ */ import_react5.default.createElement("label", { className: "flex items-center space-x-3 cursor-pointer" }, /* @__PURE__ */ import_react5.default.createElement(
    "input",
    {
      type: "checkbox",
      checked: searchFromCountry,
      onChange: (e2) => {
        setSearchFromCountry(e2.target.checked);
        if (e2.target.checked) {
          if (origin2 && origin2.length === 3) {
            const airport = allAirports.find((a2) => a2.code === origin2);
            if (airport) {
              setOriginCountry(airport.country.code);
            }
          }
        } else {
          setOriginCountry("");
        }
      },
      className: "w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
    }
  ), /* @__PURE__ */ import_react5.default.createElement("div", { className: "flex-1" }, /* @__PURE__ */ import_react5.default.createElement("span", { className: "text-sm font-medium text-gray-900" }, "\u{1F30D} Wyszukuj z wszystkich lotnisk w kraju"), /* @__PURE__ */ import_react5.default.createElement("p", { className: "text-xs text-gray-600 mt-0.5" }, "Np. wszystkie polskie lotniska (WAW, KRK, GDN, POZ, WMI, WRO...)"))), tripType === "round" && /* @__PURE__ */ import_react5.default.createElement("label", { className: "flex items-center space-x-3 cursor-pointer" }, /* @__PURE__ */ import_react5.default.createElement(
    "input",
    {
      type: "checkbox",
      checked: differentReturnAirport,
      onChange: (e2) => setDifferentReturnAirport(e2.target.checked),
      className: "w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
    }
  ), /* @__PURE__ */ import_react5.default.createElement("div", { className: "flex-1" }, /* @__PURE__ */ import_react5.default.createElement("span", { className: "text-sm font-medium text-gray-900" }, "\u2194\uFE0F Powr\xF3t na r\xF3\u017Cne lotniska (kombinacje)"), /* @__PURE__ */ import_react5.default.createElement("p", { className: "text-xs text-gray-600 mt-0.5" }, "Wylot WAW\u2192AGP\u2192KRK, KRK\u2192AGP\u2192WRO itp. (automatyczne kombinacje)"))), /* @__PURE__ */ import_react5.default.createElement("label", { className: "flex items-center space-x-3 cursor-pointer" }, /* @__PURE__ */ import_react5.default.createElement(
    "input",
    {
      type: "checkbox",
      checked: aggressiveMode,
      onChange: (e2) => setAggressiveMode(e2.target.checked),
      className: "w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
    }
  ), /* @__PURE__ */ import_react5.default.createElement("div", { className: "flex-1" }, /* @__PURE__ */ import_react5.default.createElement("span", { className: "text-sm font-medium text-gray-900" }, "\u{1F50E} Aggressive FareFinder"), /* @__PURE__ */ import_react5.default.createElement("p", { className: "text-xs text-gray-600 mt-0.5" }, "Zwi\u0119ksz tolerancj\u0119 marginesu przy zestawianiu kandydat\xF3w z miesi\u0119cznych cen.")))), /* @__PURE__ */ import_react5.default.createElement("div", { className: "relative airport-dropdown" }, /* @__PURE__ */ import_react5.default.createElement("label", { className: "block text-sm font-medium text-gray-700 mb-2" }, /* @__PURE__ */ import_react5.default.createElement(MapPin, { className: "w-4 h-4 inline mr-1" }), searchFromCountry ? "Kraj wylotu" : "Sk\u0105d"), searchFromCountry ? (
    /* Tryb wyboru kraju */
    /* @__PURE__ */ import_react5.default.createElement(
      "select",
      {
        value: originCountry,
        onChange: (e2) => {
          setOriginCountry(e2.target.value);
          setOrigin("");
        },
        className: "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      },
      /* @__PURE__ */ import_react5.default.createElement("option", { value: "" }, "Wybierz kraj..."),
      Object.values(groupedAirports).map((country) => /* @__PURE__ */ import_react5.default.createElement("option", { key: country.code, value: country.code }, country.name, " (", country.airportCount, " lotnisk)"))
    )
  ) : (
    /* Tryb pojedynczego lotniska (oryginalny) */
    /* @__PURE__ */ import_react5.default.createElement("div", { className: "relative" }, /* @__PURE__ */ import_react5.default.createElement(
      "input",
      {
        type: "text",
        value: origin2 || originSearch,
        onChange: (e2) => {
          const val = e2.target.value;
          setOriginSearch(val);
          if (val.length === 3) {
            const code = val.toUpperCase();
            const exists = allAirports.some((a2) => a2.code === code);
            setOrigin(exists ? code : "");
          } else {
            setOrigin("");
          }
          setShowOriginDropdown(true);
        },
        onFocus: () => setShowOriginDropdown(true),
        placeholder: "Kraj, miasto lub lotnisko",
        className: "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      }
    ), showOriginDropdown && !airportsLoading && /* @__PURE__ */ import_react5.default.createElement("div", { className: "absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-96 overflow-y-auto" }, /* @__PURE__ */ import_react5.default.createElement("div", { className: "p-2" }, /* @__PURE__ */ import_react5.default.createElement("p", { className: "text-xs text-gray-500 px-2 py-1" }, "Wybierz lotnisko wylotu"), Object.values(groupedAirports).filter((country) => {
      if (!originSearch) return true;
      const search = originSearch.toLowerCase();
      return country.name.toLowerCase().includes(search) || Object.values(country.cities).some(
        (city) => city.name.toLowerCase().includes(search) || city.airports.some(
          (apt) => apt.code.toLowerCase().includes(search) || apt.name.toLowerCase().includes(search)
        )
      );
    }).map((country) => /* @__PURE__ */ import_react5.default.createElement("div", { key: country.code, className: "mb-3" }, /* @__PURE__ */ import_react5.default.createElement("div", { className: "px-2 py-1 bg-gray-100 text-sm font-semibold text-gray-700" }, country.name), Object.values(country.cities).map((city) => /* @__PURE__ */ import_react5.default.createElement("div", { key: city.code, className: "ml-2" }, /* @__PURE__ */ import_react5.default.createElement("div", { className: "px-2 py-1 text-xs text-gray-600 font-medium" }, city.name), city.airports.map((airport) => /* @__PURE__ */ import_react5.default.createElement(
      "button",
      {
        key: airport.code,
        type: "button",
        onClick: () => {
          setOrigin(airport.code);
          setOriginSearch(airport.code);
          setShowOriginDropdown(false);
        },
        className: "w-full px-4 py-2 text-left hover:bg-blue-50 flex items-center justify-between group"
      },
      /* @__PURE__ */ import_react5.default.createElement("div", null, /* @__PURE__ */ import_react5.default.createElement("div", { className: "font-medium text-gray-900" }, airport.code, " - ", airport.name), /* @__PURE__ */ import_react5.default.createElement("div", { className: "text-xs text-gray-500" }, city.name, ", ", country.name)),
      airport.base && /* @__PURE__ */ import_react5.default.createElement("span", { className: "text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded" }, "Baza Ryanair")
    )))))))))
  ), searchFromCountry && originCountry && /* @__PURE__ */ import_react5.default.createElement("p", { className: "mt-1 text-sm text-green-600" }, "\u2713 Wybrano kraj: ", groupedAirports[originCountry]?.name || originCountry.toUpperCase()), !searchFromCountry && origin2 && /* @__PURE__ */ import_react5.default.createElement("p", { className: "mt-1 text-sm text-green-600" }, "\u2713 Wybrano: ", origin2)), /* @__PURE__ */ import_react5.default.createElement("div", { className: "relative airport-dropdown" }, /* @__PURE__ */ import_react5.default.createElement("label", { className: "block text-sm font-medium text-gray-700 mb-2" }, /* @__PURE__ */ import_react5.default.createElement(MapPin, { className: "w-4 h-4 inline mr-1" }), "Dok\u0105d ", origin2 && `(dost\u0119pne z ${origin2})`), /* @__PURE__ */ import_react5.default.createElement("div", { className: "relative" }, /* @__PURE__ */ import_react5.default.createElement(
    "input",
    {
      type: "text",
      value: destination || destSearch,
      onChange: (e2) => {
        const val = e2.target.value;
        setDestSearch(val);
        if (val.length === 3) {
          const code = val.toUpperCase();
          const exists = availableDestinations.some((a2) => a2.code === code);
          setDestination(exists ? code : "");
        } else {
          setDestination("");
        }
        setShowDestDropdown(true);
      },
      onFocus: () => setShowDestDropdown(true),
      placeholder: searchFromCountry ? "Wybierz cel podr\xF3\u017Cy (dowolne lotnisko)" : origin2 ? "Wybierz cel podr\xF3\u017Cy" : "Najpierw wybierz sk\u0105d",
      disabled: searchFromCountry ? false : !origin2 || loadingDestinations,
      className: "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
    }
  ), loadingDestinations && /* @__PURE__ */ import_react5.default.createElement("div", { className: "absolute right-3 top-3" }, /* @__PURE__ */ import_react5.default.createElement("div", { className: "animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600" })), showDestDropdown && !loadingDestinations && ((searchFromCountry ? countryAvailableDestinations.length > 0 : origin2 && availableDestinations.length > 0) && /* @__PURE__ */ import_react5.default.createElement("div", { className: "absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-96 overflow-y-auto" }, /* @__PURE__ */ import_react5.default.createElement("div", { className: "p-2" }, searchFromCountry ? /* @__PURE__ */ import_react5.default.createElement("p", { className: "text-xs text-blue-600 px-2 py-1 font-medium" }, "\u{1F30D} ", countryAvailableDestinations.length, " dost\u0119pnych cel\xF3w z kraju ", originCountry.toUpperCase()) : /* @__PURE__ */ import_react5.default.createElement("p", { className: "text-xs text-green-600 px-2 py-1 font-medium" }, "\u2708\uFE0F ", availableDestinations.length, " dost\u0119pnych po\u0142\u0105cze\u0144 z ", origin2), Object.entries(
    (searchFromCountry ? countryAvailableDestinations : availableDestinations).reduce((acc, airport) => {
      const country = airport.country.name;
      if (!acc[country]) acc[country] = [];
      acc[country].push(airport);
      return acc;
    }, {})
  ).filter(([country, airports]) => {
    if (!destSearch) return true;
    const search = destSearch.toLowerCase();
    return country.toLowerCase().includes(search) || airports.some(
      (apt) => apt.code.toLowerCase().includes(search) || apt.name.toLowerCase().includes(search) || apt.city.name.toLowerCase().includes(search)
    );
  }).map(([country, airports]) => /* @__PURE__ */ import_react5.default.createElement("div", { key: country, className: "mb-3" }, /* @__PURE__ */ import_react5.default.createElement("div", { className: "px-2 py-1 bg-gray-100 text-sm font-semibold text-gray-700" }, country), airports.map((airport) => /* @__PURE__ */ import_react5.default.createElement(
    "button",
    {
      key: airport.code,
      type: "button",
      onClick: () => {
        setDestination(airport.code);
        setDestSearch(airport.code);
        setShowDestDropdown(false);
      },
      className: "w-full px-4 py-2 text-left hover:bg-blue-50 flex items-center justify-between group"
    },
    /* @__PURE__ */ import_react5.default.createElement("div", null, /* @__PURE__ */ import_react5.default.createElement("div", { className: "font-medium text-gray-900" }, airport.code, " - ", airport.name), /* @__PURE__ */ import_react5.default.createElement("div", { className: "text-xs text-gray-500" }, airport.city.name, ", ", country)),
    airport.base && /* @__PURE__ */ import_react5.default.createElement("span", { className: "text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded" }, "Baza")
  )))))))), destination && /* @__PURE__ */ import_react5.default.createElement("p", { className: "mt-1 text-sm text-green-600" }, "\u2713 Wybrano: ", destination), origin2 && !loadingDestinations && availableDestinations.length === 0 && /* @__PURE__ */ import_react5.default.createElement("p", { className: "mt-1 text-sm text-red-600" }, "\u26A0\uFE0F Brak dost\u0119pnych po\u0142\u0105cze\u0144 z ", origin2)), /* @__PURE__ */ import_react5.default.createElement("div", { className: "flex gap-4 items-center" }, /* @__PURE__ */ import_react5.default.createElement("label", { className: "flex items-center gap-2" }, /* @__PURE__ */ import_react5.default.createElement("input", { type: "radio", name: "tripType", value: "oneway", checked: tripType === "oneway", onChange: () => setTripType("oneway") }), /* @__PURE__ */ import_react5.default.createElement("span", { className: "ml-1" }, "Jednokierunkowy")), /* @__PURE__ */ import_react5.default.createElement("label", { className: "flex items-center gap-2" }, /* @__PURE__ */ import_react5.default.createElement("input", { type: "radio", name: "tripType", value: "round", checked: tripType === "round", onChange: () => setTripType("round") }), /* @__PURE__ */ import_react5.default.createElement("span", { className: "ml-1" }, "W obie strony"))), /* @__PURE__ */ import_react5.default.createElement("div", null, /* @__PURE__ */ import_react5.default.createElement("label", { className: "block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2" }, /* @__PURE__ */ import_react5.default.createElement(Calendar, { className: "w-4 h-4" }), "Zakres dat wylotu"), /* @__PURE__ */ import_react5.default.createElement("div", { className: "flex gap-2" }, /* @__PURE__ */ import_react5.default.createElement(
    "input",
    {
      type: "date",
      value: dateFrom,
      onChange: (e2) => setDateFrom(e2.target.value),
      min: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
      className: "w-1/2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    }
  ), /* @__PURE__ */ import_react5.default.createElement(
    "input",
    {
      type: "date",
      value: dateTo,
      onChange: (e2) => setDateTo(e2.target.value),
      min: dateFrom || (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
      className: "w-1/2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    }
  )), /* @__PURE__ */ import_react5.default.createElement("div", { className: "mt-2 flex gap-2 items-center" }, /* @__PURE__ */ import_react5.default.createElement("div", { className: "flex-1" }, /* @__PURE__ */ import_react5.default.createElement("label", { className: "text-xs text-gray-500" }, "Wylot (zakres)"), /* @__PURE__ */ import_react5.default.createElement("input", { type: "time", value: departureFrom, onChange: (e2) => setDepartureFrom(e2.target.value), className: "w-full px-3 py-2 border rounded mb-2" }), /* @__PURE__ */ import_react5.default.createElement("input", { type: "time", value: departureTo, onChange: (e2) => setDepartureTo(e2.target.value), className: "w-full px-3 py-2 border rounded mb-2" }), /* @__PURE__ */ import_react5.default.createElement("div", { className: "mt-2 relative", style: { height: 36 } }, /* @__PURE__ */ import_react5.default.createElement("div", { className: "absolute inset-0 px-1 flex items-center" }, /* @__PURE__ */ import_react5.default.createElement("div", { className: "w-full h-2 rounded bg-gray-200", style: rangeTrackStyle(departureFromMin, departureToMin) })), /* @__PURE__ */ import_react5.default.createElement("input", { type: "range", min: "0", max: "1439", step: "15", value: departureFromMin, onChange: (e2) => {
    const v2 = Number(e2.target.value);
    if (v2 > departureToMin) setDepartureToMin(v2);
    setDepartureFromMin(v2);
  }, className: "absolute inset-0 w-full h-9 appearance-none bg-transparent", style: { zIndex: 2 } }), /* @__PURE__ */ import_react5.default.createElement("input", { type: "range", min: "0", max: "1439", step: "15", value: departureToMin, onChange: (e2) => {
    const v2 = Number(e2.target.value);
    if (v2 < departureFromMin) setDepartureFromMin(v2);
    setDepartureToMin(v2);
  }, className: "absolute inset-0 w-full h-9 appearance-none bg-transparent", style: { zIndex: 3 } }), /* @__PURE__ */ import_react5.default.createElement("div", { className: "text-xs text-gray-500 mt-1" }, minutesToTime(departureFromMin), " \u2014 ", minutesToTime(departureToMin)))), /* @__PURE__ */ import_react5.default.createElement("div", { className: "flex-1" }, /* @__PURE__ */ import_react5.default.createElement("label", { className: "text-xs text-gray-500" }, "Przylot (zakres)"), /* @__PURE__ */ import_react5.default.createElement("input", { type: "time", value: arrivalFrom, onChange: (e2) => setArrivalFrom(e2.target.value), className: "w-full px-3 py-2 border rounded mb-2" }), /* @__PURE__ */ import_react5.default.createElement("input", { type: "time", value: arrivalTo, onChange: (e2) => setArrivalTo(e2.target.value), className: "w-full px-3 py-2 border rounded mb-2" }), /* @__PURE__ */ import_react5.default.createElement("div", { className: "mt-2 relative", style: { height: 36 } }, /* @__PURE__ */ import_react5.default.createElement("div", { className: "absolute inset-0 px-1 flex items-center" }, /* @__PURE__ */ import_react5.default.createElement("div", { className: "w-full h-2 rounded bg-gray-200", style: rangeTrackStyle(arrivalFromMin, arrivalToMin) })), /* @__PURE__ */ import_react5.default.createElement("input", { type: "range", min: "0", max: "1439", step: "15", value: arrivalFromMin, onChange: (e2) => {
    const v2 = Number(e2.target.value);
    if (v2 > arrivalToMin) setArrivalToMin(v2);
    setArrivalFromMin(v2);
  }, className: "absolute inset-0 w-full h-9 appearance-none bg-transparent", style: { zIndex: 2 } }), /* @__PURE__ */ import_react5.default.createElement("input", { type: "range", min: "0", max: "1439", step: "15", value: arrivalToMin, onChange: (e2) => {
    const v2 = Number(e2.target.value);
    if (v2 < arrivalFromMin) setArrivalFromMin(v2);
    setArrivalToMin(v2);
  }, className: "absolute inset-0 w-full h-9 appearance-none bg-transparent", style: { zIndex: 3 } }), /* @__PURE__ */ import_react5.default.createElement("div", { className: "text-xs text-gray-500 mt-1" }, minutesToTime(arrivalFromMin), " \u2014 ", minutesToTime(arrivalToMin)))), /* @__PURE__ */ import_react5.default.createElement("div", { className: "mt-3 w-full" }, /* @__PURE__ */ import_react5.default.createElement("label", { className: "text-xs text-gray-500" }, "Dni wylotu"), /* @__PURE__ */ import_react5.default.createElement("div", { className: "flex gap-2 mt-2 items-center" }, /* @__PURE__ */ import_react5.default.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ import_react5.default.createElement("select", { className: "px-2 py-1 border rounded", value: departureDayStart, onChange: (e2) => setDepartureDayStart(Number(e2.target.value)) }, ["Pn", "Wt", "\u015Ar", "Cz", "Pt", "Sb", "Nd"].map((l2, i2) => /* @__PURE__ */ import_react5.default.createElement("option", { key: `dstart-${i2}`, value: i2 }, l2))), /* @__PURE__ */ import_react5.default.createElement("span", { className: "text-sm text-gray-500" }, "do"), /* @__PURE__ */ import_react5.default.createElement("select", { className: "px-2 py-1 border rounded", value: departureDayEnd, onChange: (e2) => setDepartureDayEnd(Number(e2.target.value)) }, ["Pn", "Wt", "\u015Ar", "Cz", "Pt", "Sb", "Nd"].map((l2, i2) => /* @__PURE__ */ import_react5.default.createElement("option", { key: `dend-${i2}`, value: i2 }, l2)))), /* @__PURE__ */ import_react5.default.createElement("div", { className: "flex gap-2 ml-4" }, ["P", "W", "S", "C", "P", "S", "N"].map((label, idx) => /* @__PURE__ */ import_react5.default.createElement("button", { key: `out-day-${idx}`, type: "button", className: `w-8 h-8 rounded-full flex items-center justify-center ${departureDays[idx] ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600"}`, onClick: () => {
    const newDays = [...departureDays];
    newDays[idx] = !newDays[idx];
    setDepartureDays(newDays);
  } }, label))))), /* @__PURE__ */ import_react5.default.createElement("div", { className: "flex-1" }, /* @__PURE__ */ import_react5.default.createElement("label", { className: "text-xs text-gray-500" }, "Wylot do"), /* @__PURE__ */ import_react5.default.createElement("input", { type: "time", value: departureTo, onChange: (e2) => setDepartureTo(e2.target.value), className: "w-full px-3 py-2 border rounded" }), /* @__PURE__ */ import_react5.default.createElement("div", { className: "mt-2" }, /* @__PURE__ */ import_react5.default.createElement("input", { type: "range", min: "0", max: "1439", step: "15", value: departureToMin, onChange: (e2) => {
    const v2 = Number(e2.target.value);
    if (v2 < departureFromMin) {
      setDepartureFromMin(v2);
    }
    setDepartureToMin(v2);
  }, className: "w-full" }), /* @__PURE__ */ import_react5.default.createElement("div", { className: "text-xs text-gray-500 mt-1" }, "Do ", minutesToTime(departureToMin)))), /* @__PURE__ */ import_react5.default.createElement("div", { className: "flex-1" }, /* @__PURE__ */ import_react5.default.createElement("label", { className: "text-xs text-gray-500" }, "Przylot do"), /* @__PURE__ */ import_react5.default.createElement("input", { type: "time", value: arrivalTo, onChange: (e2) => setArrivalTo(e2.target.value), className: "w-full px-3 py-2 border rounded" }), /* @__PURE__ */ import_react5.default.createElement("div", { className: "mt-2" }, /* @__PURE__ */ import_react5.default.createElement("input", { type: "range", min: "0", max: "1439", step: "15", value: arrivalToMin, onChange: (e2) => {
    const v2 = Number(e2.target.value);
    if (v2 < arrivalFromMin) setArrivalFromMin(v2);
    setArrivalToMin(v2);
  }, className: "w-full" }), /* @__PURE__ */ import_react5.default.createElement("div", { className: "text-xs text-gray-500 mt-1" }, "Do ", minutesToTime(arrivalToMin)))))), tripType === "round" && /* @__PURE__ */ import_react5.default.createElement("div", null, /* @__PURE__ */ import_react5.default.createElement("label", { className: "block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2" }, /* @__PURE__ */ import_react5.default.createElement(Calendar, { className: "w-4 h-4" }), "D\u0142ugo\u015B\u0107 pobytu (dni)"), /* @__PURE__ */ import_react5.default.createElement("div", { className: "flex gap-2 items-center" }, /* @__PURE__ */ import_react5.default.createElement(
    "input",
    {
      type: "number",
      value: stayDaysMin,
      onChange: (e2) => {
        const value = e2.target.value;
        if (value === "") {
          setStayDaysMin("");
        } else {
          const num = Number(value);
          if (num >= 1 && num <= maxStayDays) {
            setStayDaysMin(num);
          }
        }
      },
      onBlur: (e2) => {
        if (e2.target.value === "" || Number(e2.target.value) < 1) {
          setStayDaysMin(1);
        }
        if (Number(e2.target.value) > maxStayDays) {
          setStayDaysMin(maxStayDays);
        }
      },
      min: "1",
      max: maxStayDays,
      placeholder: "1",
      className: "w-24 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    }
  ), /* @__PURE__ */ import_react5.default.createElement("span", { className: "text-gray-600" }, "-"), /* @__PURE__ */ import_react5.default.createElement(
    "input",
    {
      type: "number",
      value: stayDaysMax,
      onChange: (e2) => {
        const value = e2.target.value;
        if (value === "") {
          setStayDaysMax("");
        } else {
          const num = Number(value);
          if (num >= 1 && num <= maxStayDays) {
            setStayDaysMax(num);
          }
        }
      },
      onBlur: (e2) => {
        const val = Number(e2.target.value);
        if (e2.target.value === "" || val < 1) {
          setStayDaysMax(Math.min(7, maxStayDays));
        }
        if (val > maxStayDays) {
          setStayDaysMax(maxStayDays);
        }
        if (val < stayDaysMin) {
          setStayDaysMax(stayDaysMin);
        }
      },
      min: stayDaysMin || 1,
      max: maxStayDays,
      placeholder: "7",
      className: "w-24 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    }
  ), /* @__PURE__ */ import_react5.default.createElement("span", { className: "text-sm text-gray-500" }, "dni (max ", maxStayDays, ")")), /* @__PURE__ */ import_react5.default.createElement("p", { className: "text-xs text-gray-500 mt-1" }, "Przyk\u0142ad: 1-1 = wylot i powr\xF3t tego samego dnia, 7-7 = dok\u0142adnie tydzie\u0144")), tripType === "round" && /* @__PURE__ */ import_react5.default.createElement("div", { className: "mt-2" }, /* @__PURE__ */ import_react5.default.createElement("div", { className: "mt-2 flex gap-2 items-center" }, /* @__PURE__ */ import_react5.default.createElement("div", { className: "flex-1" }, /* @__PURE__ */ import_react5.default.createElement("label", { className: "text-xs text-gray-500" }, "Wylot powrotny (zakres)"), /* @__PURE__ */ import_react5.default.createElement("input", { type: "time", value: returnDepartureFrom, onChange: (e2) => setReturnDepartureFrom(e2.target.value), className: "w-full px-3 py-2 border rounded mb-2" }), /* @__PURE__ */ import_react5.default.createElement("input", { type: "time", value: returnDepartureTo, onChange: (e2) => setReturnDepartureTo(e2.target.value), className: "w-full px-3 py-2 border rounded mb-2" }), /* @__PURE__ */ import_react5.default.createElement("div", { className: "mt-2 relative", style: { height: 36 } }, /* @__PURE__ */ import_react5.default.createElement("div", { className: "absolute inset-0 px-1 flex items-center" }, /* @__PURE__ */ import_react5.default.createElement("div", { className: "w-full h-2 rounded bg-gray-200", style: rangeTrackStyle(returnDepartureFromMin, returnDepartureToMin) })), /* @__PURE__ */ import_react5.default.createElement("input", { type: "range", min: "0", max: "1439", step: "15", value: returnDepartureFromMin, onChange: (e2) => {
    const v2 = Number(e2.target.value);
    if (v2 > returnDepartureToMin) setReturnDepartureToMin(v2);
    setReturnDepartureFromMin(v2);
  }, className: "absolute inset-0 w-full h-9 appearance-none bg-transparent", style: { zIndex: 2 } }), /* @__PURE__ */ import_react5.default.createElement("input", { type: "range", min: "0", max: "1439", step: "15", value: returnDepartureToMin, onChange: (e2) => {
    const v2 = Number(e2.target.value);
    if (v2 < returnDepartureFromMin) setReturnDepartureFromMin(v2);
    setReturnDepartureToMin(v2);
  }, className: "absolute inset-0 w-full h-9 appearance-none bg-transparent", style: { zIndex: 3 } }), /* @__PURE__ */ import_react5.default.createElement("div", { className: "text-xs text-gray-500 mt-1" }, minutesToTime(returnDepartureFromMin), " \u2014 ", minutesToTime(returnDepartureToMin)))), /* @__PURE__ */ import_react5.default.createElement("div", { className: "flex-1" }, /* @__PURE__ */ import_react5.default.createElement("label", { className: "text-xs text-gray-500" }, "Przylot powrotny (zakres)"), /* @__PURE__ */ import_react5.default.createElement("input", { type: "time", value: returnArrivalFrom, onChange: (e2) => setReturnArrivalFrom(e2.target.value), className: "w-full px-3 py-2 border rounded mb-2" }), /* @__PURE__ */ import_react5.default.createElement("input", { type: "time", value: returnArrivalTo, onChange: (e2) => setReturnArrivalTo(e2.target.value), className: "w-full px-3 py-2 border rounded mb-2" }), /* @__PURE__ */ import_react5.default.createElement("div", { className: "mt-2 relative", style: { height: 36 } }, /* @__PURE__ */ import_react5.default.createElement("div", { className: "absolute inset-0 px-1 flex items-center" }, /* @__PURE__ */ import_react5.default.createElement("div", { className: "w-full h-2 rounded bg-gray-200", style: rangeTrackStyle(returnArrivalFromMin, returnArrivalToMin) })), /* @__PURE__ */ import_react5.default.createElement("input", { type: "range", min: "0", max: "1439", step: "15", value: returnArrivalFromMin, onChange: (e2) => {
    const v2 = Number(e2.target.value);
    if (v2 > returnArrivalToMin) setReturnArrivalToMin(v2);
    setReturnArrivalFromMin(v2);
  }, className: "absolute inset-0 w-full h-9 appearance-none bg-transparent", style: { zIndex: 2 } }), /* @__PURE__ */ import_react5.default.createElement("input", { type: "range", min: "0", max: "1439", step: "15", value: returnArrivalToMin, onChange: (e2) => {
    const v2 = Number(e2.target.value);
    if (v2 < returnArrivalFromMin) setReturnArrivalFromMin(v2);
    setReturnArrivalToMin(v2);
  }, className: "absolute inset-0 w-full h-9 appearance-none bg-transparent", style: { zIndex: 3 } }), /* @__PURE__ */ import_react5.default.createElement("div", { className: "text-xs text-gray-500 mt-1" }, minutesToTime(returnArrivalFromMin), " \u2014 ", minutesToTime(returnArrivalToMin)))), /* @__PURE__ */ import_react5.default.createElement("div", { className: "mt-3 w-full" }, /* @__PURE__ */ import_react5.default.createElement("label", { className: "text-xs text-gray-500" }, "Dni powrotu"), /* @__PURE__ */ import_react5.default.createElement("div", { className: "flex gap-2 mt-2 items-center" }, /* @__PURE__ */ import_react5.default.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ import_react5.default.createElement("select", { className: "px-2 py-1 border rounded", value: returnDayStart, onChange: (e2) => setReturnDayStart(Number(e2.target.value)) }, ["Pn", "Wt", "\u015Ar", "Cz", "Pt", "Sb", "Nd"].map((l2, i2) => /* @__PURE__ */ import_react5.default.createElement("option", { key: `rstart-${i2}`, value: i2 }, l2))), /* @__PURE__ */ import_react5.default.createElement("span", { className: "text-sm text-gray-500" }, "do"), /* @__PURE__ */ import_react5.default.createElement("select", { className: "px-2 py-1 border rounded", value: returnDayEnd, onChange: (e2) => setReturnDayEnd(Number(e2.target.value)) }, ["Pn", "Wt", "\u015Ar", "Cz", "Pt", "Sb", "Nd"].map((l2, i2) => /* @__PURE__ */ import_react5.default.createElement("option", { key: `rend-${i2}`, value: i2 }, l2)))), /* @__PURE__ */ import_react5.default.createElement("div", { className: "flex gap-2 ml-4" }, ["P", "W", "S", "C", "P", "S", "N"].map((label, idx) => /* @__PURE__ */ import_react5.default.createElement("button", { key: `ret-day-${idx}`, type: "button", className: `w-8 h-8 rounded-full flex items-center justify-center ${returnDays[idx] ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600"}`, onClick: () => {
    const newDays = [...returnDays];
    newDays[idx] = !newDays[idx];
    setReturnDays(newDays);
  } }, label))))), /* @__PURE__ */ import_react5.default.createElement("div", { className: "flex-1" }, /* @__PURE__ */ import_react5.default.createElement("label", { className: "text-xs text-gray-500" }, "Przylot do"), /* @__PURE__ */ import_react5.default.createElement("input", { type: "time", value: returnArrivalTo, onChange: (e2) => setReturnArrivalTo(e2.target.value), className: "w-full px-3 py-2 border rounded" }), /* @__PURE__ */ import_react5.default.createElement("div", { className: "mt-2" }, /* @__PURE__ */ import_react5.default.createElement("input", { type: "range", min: "0", max: "1439", step: "15", value: returnArrivalToMin, onChange: (e2) => {
    const v2 = Number(e2.target.value);
    if (v2 < returnArrivalFromMin) setReturnArrivalFromMin(v2);
    setReturnArrivalToMin(v2);
  }, className: "w-full" }), /* @__PURE__ */ import_react5.default.createElement("div", { className: "text-xs text-gray-500 mt-1" }, "Do ", minutesToTime(returnArrivalToMin)))))), /* @__PURE__ */ import_react5.default.createElement("div", null, /* @__PURE__ */ import_react5.default.createElement("label", { className: "block text-sm font-medium text-gray-700 mb-2" }, "Max cena ", tripType === "round" ? "\u0142\u0105cznie" : "", " (opcjonalne)"), /* @__PURE__ */ import_react5.default.createElement("div", { className: "flex gap-2 items-center" }, /* @__PURE__ */ import_react5.default.createElement(
    "input",
    {
      type: "number",
      value: maxPrice,
      onChange: (e2) => setMaxPrice(e2.target.value),
      min: "0",
      placeholder: "np. 500",
      className: "w-32 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    }
  ), /* @__PURE__ */ import_react5.default.createElement("span", { className: "text-sm text-gray-500" }, "PLN")), /* @__PURE__ */ import_react5.default.createElement("p", { className: "text-xs text-gray-500 mt-1" }, "\u26A1 Podanie max ceny przyspiesza wyszukiwanie - sprawdzamy tylko tanie dni")), /* @__PURE__ */ import_react5.default.createElement("div", null, /* @__PURE__ */ import_react5.default.createElement("label", { className: "block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2" }, /* @__PURE__ */ import_react5.default.createElement(Users, { className: "w-4 h-4" }), "Liczba os\xF3b doros\u0142ych"), /* @__PURE__ */ import_react5.default.createElement(
    "input",
    {
      type: "number",
      value: adults,
      onChange: (e2) => setAdults(parseInt(e2.target.value) || 1),
      min: 1,
      max: 10,
      className: "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    }
  )), /* @__PURE__ */ import_react5.default.createElement("div", { className: "flex gap-2" }, /* @__PURE__ */ import_react5.default.createElement(
    "button",
    {
      type: "submit",
      disabled: (searchFromCountry ? !originCountry : !origin2) || !destination || !dateFrom || !dateTo || isSubmitting,
      className: "w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
    },
    /* @__PURE__ */ import_react5.default.createElement(Search, { className: "w-5 h-5" }),
    isSubmitting ? "Szukam..." : "Szukaj Lot\xF3w"
  ), /* @__PURE__ */ import_react5.default.createElement(
    "button",
    {
      type: "button",
      onClick: handleDebugPairClick,
      className: "bg-gray-200 text-gray-800 py-3 px-4 rounded-lg font-medium hover:bg-gray-300 flex items-center gap-2"
    },
    "\u{1F9EA} Debug pair"
  )), isSubmitting && searchProgress.total > 0 && /* @__PURE__ */ import_react5.default.createElement("div", { className: "mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg" }, /* @__PURE__ */ import_react5.default.createElement("div", { className: "flex items-center justify-between mb-2" }, /* @__PURE__ */ import_react5.default.createElement("span", { className: "text-sm font-medium text-blue-900" }, "Przeszukuj\u0119 lotniska: ", searchProgress.current, " / ", searchProgress.total), /* @__PURE__ */ import_react5.default.createElement(
    "button",
    {
      onClick: () => setCancelSearch(true),
      className: "px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
    },
    "Anuluj"
  )), /* @__PURE__ */ import_react5.default.createElement("div", { className: "w-full bg-blue-200 rounded-full h-2 mb-2" }, /* @__PURE__ */ import_react5.default.createElement(
    "div",
    {
      className: "bg-blue-600 h-2 rounded-full transition-all duration-300",
      style: { width: `${searchProgress.current / searchProgress.total * 100}%` }
    }
  )), searchProgress.currentAirport && /* @__PURE__ */ import_react5.default.createElement("p", { className: "text-xs text-blue-700" }, "Obecnie: ", searchProgress.currentAirport))), /* @__PURE__ */ import_react5.default.createElement("div", { className: "mt-4 text-sm text-gray-500" }, "\u{1F4A1} Przyk\u0142adowe kody lotnisk: WAW (Warszawa), POZ (Pozna\u0144), KRK (Krak\xF3w), VIE (Wiede\u0144), BCN (Barcelona), MAD (Madryt)"));
}
export {
  SearchForm as default
};
/*! Bundled license information:

react/cjs/react.development.js:
  (**
   * @license React
   * react.development.js
   *
   * Copyright (c) Facebook, Inc. and its affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)

use-sync-external-store/cjs/use-sync-external-store-shim.development.js:
  (**
   * @license React
   * use-sync-external-store-shim.development.js
   *
   * Copyright (c) Meta Platforms, Inc. and affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)

use-sync-external-store/cjs/use-sync-external-store-shim/with-selector.development.js:
  (**
   * @license React
   * use-sync-external-store-shim/with-selector.development.js
   *
   * Copyright (c) Meta Platforms, Inc. and affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)

lucide-react/dist/esm/defaultAttributes.js:
  (**
   * @license lucide-react v0.295.0 - ISC
   *
   * This source code is licensed under the ISC license.
   * See the LICENSE file in the root directory of this source tree.
   *)

lucide-react/dist/esm/createLucideIcon.js:
  (**
   * @license lucide-react v0.295.0 - ISC
   *
   * This source code is licensed under the ISC license.
   * See the LICENSE file in the root directory of this source tree.
   *)

lucide-react/dist/esm/icons/calendar.js:
  (**
   * @license lucide-react v0.295.0 - ISC
   *
   * This source code is licensed under the ISC license.
   * See the LICENSE file in the root directory of this source tree.
   *)

lucide-react/dist/esm/icons/map-pin.js:
  (**
   * @license lucide-react v0.295.0 - ISC
   *
   * This source code is licensed under the ISC license.
   * See the LICENSE file in the root directory of this source tree.
   *)

lucide-react/dist/esm/icons/plane.js:
  (**
   * @license lucide-react v0.295.0 - ISC
   *
   * This source code is licensed under the ISC license.
   * See the LICENSE file in the root directory of this source tree.
   *)

lucide-react/dist/esm/icons/search.js:
  (**
   * @license lucide-react v0.295.0 - ISC
   *
   * This source code is licensed under the ISC license.
   * See the LICENSE file in the root directory of this source tree.
   *)

lucide-react/dist/esm/icons/users.js:
  (**
   * @license lucide-react v0.295.0 - ISC
   *
   * This source code is licensed under the ISC license.
   * See the LICENSE file in the root directory of this source tree.
   *)

lucide-react/dist/esm/lucide-react.js:
  (**
   * @license lucide-react v0.295.0 - ISC
   *
   * This source code is licensed under the ISC license.
   * See the LICENSE file in the root directory of this source tree.
   *)
*/

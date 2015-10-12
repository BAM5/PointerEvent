(function(){
	
	var PointerEvent = window.PointerEvent = Class(
		
		/**
		 * @classdesc
		 * This class will unify mouse and touch events into a single type of event, PointerEvent.
		 * 
		 * This library attempts to adhere as close as is possible to [the published w3 spec for pointer events as of 2/24/15](http://www.w3.org/TR/2015/REC-pointerevents-20150224/).
		 * 
		 * @global
		 * @constructs PointerEvent
		 * @requires [BAM5/JSClass](https://github.com/BAM5/JSClass)
		 * 
		 * @param   {String}               type                                                      The type of event this is
		 * @param   {Object}               [props]                                                   Properties that should be added to this event.
		 *  @param   {Number}               [props.pointerId=0]                                       The pointerId that the new event should refer to.
		 *  @param   {Number}               [props.width=0]                                           The width of the contact area on the coordinate system.
		 *  @param   {Number}               [props.height=0]                                          The height of the contact area on the coordinate system.
		 *  @param   {Number}               [props.pressure=0]                                        The amount of pressure the pointer is enacting on the contact area.
		 *  @param   {Number}               [props.tiltX=0]                                           The angle at which the pointer is contacting the contact area along the x axis.
		 *  @param   {Number}               [props.tiltY=0]                                           The angle at which the pointer is contacting the contact area along the y axis.
		 *  @param   {String}               [props.pointerType=PointerEvent.POINTER_TYPE_UNAVAILABLE] The type of pointing device that is the source of this event.
		 *  @param   {Boolean}              [props.isPrimary=false]                                   Whether or not the pointer that this event refers to is the primary pointer of its pointer type.
		 *  @param   {MoueEvent|TouchEvent} [props.baseEvent=]                                        The event which has caused this PointerEvent to be created.		
		 * @returns {PointerEvent}         Returns a new PointerEvent instance
		 */
		function PointerEvent(type, props){
			if(!props) props = {};

			var baseEvent = props.baseEvent;
			var bubbles = Boolean(props.bubbles);
			var cancelable = Boolean(props.cancelable);
			var pointerEvent = document.createEvent("MouseEvent");
			var pointerId	= props.pointerId	|| 0,
				width		= props.width		|| 0,
				height		= props.height		|| 0,
				pressure	= props.pressure	|| 0,
				tiltX		= props.tiltX		|| 0,
				tiltY		= props.tiltY		|| 0,
				pointerType	= props.pointerType	|| PointerEvent.POINTER_TYPE_UNAVAILABLE,
				isPrimary	= props.isPrimary	|| false;

			if(baseEvent instanceof MouseEvent){
				pointerEvent.initMouseEvent(
					type, bubbles, cancelable,
					baseEvent.view,
					baseEvent.detail,
					baseEvent.screenX, baseEvent.screenY,
					baseEvent.clientX, baseEvent.clientY,
					baseEvent.ctrlKey, baseEvent.altKey, baseEvent.shiftKey, baseEvent.metaKey,
					baseEvent.button,
					props.relatedTarget || baseEvent.relatedTarget || null
				);
				pointerEvent.buttons = baseEvent.buttons || PointerEvent._pointers[1].buttons;
				pointerId = 1;
				width = 1;
				height = 1;
				pointerType = PointerEvent.POINTER_TYPE_MOUSE;
				isPrimary = true;
			} else if(baseEvent instanceof TouchEvent){
				var touch = props.touch || {};
				pointerEvent.initMouseEvent(
					type, bubbles, cancelable,
					window,
					1,
					touch.screenX, touch.screenY,
					touch.clientX, touch.clientY,
					baseEvent.ctrlKey, baseEvent.altKey, baseEvent.shiftKey, baseEvent.metaKey,
					0,
					props.relatedTarget || null
				);
				pointerId	= PointerEvent._T2P[touch.identifier];
				pointerType = PointerEvent.POINTER_TYPE_TOUCH;
				width		= touch.radiusX;
				height		= touch.radiusY;
				pressure	= touch.force;

				for(var key in PointerEvent._T2P){
					isPrimary	= touch.identifier === key;
					break;
				}
			}

			if(window.MSPointerEvent && baseEvent instanceof MSPointerEvent){
				pointerId	= PointerEvent._MSP2P[baseEvent.pointerId];
				width		= baseEvent.width;
				height		= baseEvent.height;
				pressure	= baseEvent.pressure;
				tiltX		= baseEvent.tiltX;
				tiltY		= baseEvent.tiltY;

				switch(baseEvent.pointerType){
					case 1:
						pointerType = PointerEvent.POINTER_TYPE_UNAVAILABLE;
						break;
					case 2:
						pointerType = PointerEvent.POINTER_TYPE_TOUCH;
						break;
					case 3:
						pointerType = PointerEvent.POINTER_TYPE_PEN;
						break;
					case 4:
						pointerType = PointerEvent.POINTER_TYPE_MOUSE;
						break;
				}

				isPrimary = baseEvent.isPrimary;
			}

			// Set Readonly Properties
			Object.defineProperties(pointerEvent, 
				/** @lends PointerEvent# */ 
				{
					/**
					 * The id of the pointer that this event is related to.
					 * @type {number}
					 */
					pointerId: {
						enumerable:	true,
						value:		pointerId
					},
					
					/**
					 * The width of the contact area on the coordinate system.
					 * @type {number}
					 */
					width: {
						enumerable:	true,
						value:		width
					},
				
					/**
					 * The height of the contact area on the coordinate system.
					 * @type {number}
					 */
					height: {
						enumerable:	true,
						value:		height
					},

					/**
					 * The amount of pressure the pointer is enacting on the contact area.  
					 * This is most relevant with pen and touch pointer types. However this library is unable to detect pen input.
					 * @type {number}
					 */
					pressure: {
						enumerable:	true,
						value:		pressure
					},

					/**
					 * The angle at which the pointer is contacting the contact area along the x axis.
					 * @type {number}
					 */
					tiltX: {
						enumerable:	true,
						value:		tiltX
					},

					/**
					 * The angle at which the pointer is contacting the contact area along the y axis.
					 * @type {number}
					 */
					tiltY: {
						enumerable:	true,
						value:		tiltY
					},

					/**
					 * The type of pointing device that is the source of this event.
					 * @type {string}
					 */
					pointerType: {
						enumerable:	true,
						value:		pointerType
					},

					/**
					 * Whether or not the pointer that this event refers to is the primary pointer of its pointer type.
					 * @type {boolean}
					 */
					isPrimary: {
						enumerable:	true,
						value:		isPrimary
					},

					/**
					 * The base event that was used to make this PointerEvent
					 * @type {(TouchEvent|MouseEvent)}
					 */
					baseEvent: {
						enumerable:	true,
						value:		baseEvent
					}
				}
			);

			// Next line of code, although frowned upon, is unavoidable, unless you don't want <pointerEvent instanceof PointerEvent> to return true.
			// Also breaks it. Soooo, yeah, just commenting it out here. Not too important.
			// Object.setPrototypeOf(pointerEvent, PointerEvent.prototype);

			return pointerEvent;
		},
		
		/** @lends PointerEvent */
		{
			/**
			 * Tell the PointerEvent Class to monitor an element and convert mouse and touch events to the best of PointerEvent Class's abilities to PointerEvents.
			 * 
			 * @param {EventTarget} element                                Regularly a dom element to listen for mouse and touch events on to convert to PointerEvents.  
			 *                                                             Doesn't have to be an Element, just an EventTarget.
			 * @param {object}      [options={}]                           An object with options to modify how the PointerEvent Class interprets Mouse and Touch Events.
			 * @param {Boolean}     [options.stopBaseEvent=true]           Whether or not the PointerEvent Class should stop the propagation of the base Mouse/Touch event.
			 * @param {Boolean}     [options.stopCompatibilityEvents=true] Whether or not the PointerEvent Class should stop the propagation of mouse compatibility events.
			 */
			InterpretEvents: function InterpretEvents(element, options){
				options = options || {};
				options.stopBaseEvent = (options.stopBaseEvent !== undefined)? options.stopBaseEvent : true;
				options.stopCompatibilityEvents = (options.stopCompatibilityEvents !== undefined)? options.stopCompatibilityEvents : true;

				if(!(element instanceof EventTarget)) throw new Error("Value passed as the paramenter \"element\" is not an EventTarget and thus cannot have Mouse, Touch, or MSPointer events fired on them, nor can we fire a PointerEvent on this element");

				var aEL = EventTarget.prototype.addEventListener.bind(element);
				element._pointerEvent = {opts: options};

				// IE
				// Convert Vendor Prefix Event into w3c compliant event.
				if(window.MSPointerEvent){
					aEL("MSPointerOver",	PointerEvent._msPointerCatch,	true);
					aEL("MSPointerDown",	PointerEvent._msPointerCatch,	true);
					aEL("MSPointerMove",	PointerEvent._msPointerCatch,	true);
					aEL("MSPointerCancel",	PointerEvent._msPointerCatch,	true);
					aEL("MSPointerOut",		PointerEvent._msPointerCatch,	true);
					aEL("MSPointerUp",		PointerEvent._msPointerCatch,	true);
				}

				// Chrome / Mozilla
				if(window.TouchEvent){
					aEL("touchstart",	PointerEvent._touchStart,	true);
				}

				aEL("mousedown",	PointerEvent._mouseCatch,	true);
				aEL("mousemove",	PointerEvent._mouseCatch,	true);
				aEL("mouseenter",	PointerEvent._mouseCatch,	true);
				aEL("mouseover",	PointerEvent._mouseCatch,	true);
				aEL("mouseout",		PointerEvent._mouseCatch,	true);
				aEL("mouseleave",	PointerEvent._mouseCatch,	true);
				aEL("mouseup",		PointerEvent._mouseCatch,	true);
				aEL("click",		PointerEvent._mouseCatch,	true);
			},

			/**
			 * This function informs PointerEvent Class to stop monitoring the provided element, reversing the call to PointerEvent.InterpretEventns
			 * @param {EventTarget} element Regularly a dom element that has its mouse and touch events being interpreted by the PointerEvent Class.  
			 *                              Doesn't necessarily have to be an Element, just an EventTarget.
			 */
			RemoveInterpretation: function RemoveInterpretation(element){
				if(!element._pointerEventOpts) return;

				var rEL = EventTarget.prototype.removeEventListener.bind(element);
				delete element._pointerEventOpts;

				// IE
				// Convert Vendor Prefix Event into w3c compliant event.
				if(window.MSPointerEvent){
					rEL("MSPointerOver",	PointerEvent._msPointerCatch,	true);
					rEL("MSPointerDown",	PointerEvent._msPointerCatch,	true);
					rEL("MSPointerMove",	PointerEvent._msPointerCatch,	true);
					rEL("MSPointerCancel",	PointerEvent._msPointerCatch,	true);
					rEL("MSPointerOut",		PointerEvent._msPointerCatch,	true);
					rEL("MSPointerUp",		PointerEvent._msPointerCatch,	true);
				}

				// Chrome / Mozilla
				else if(window.TouchEvent){
					rEL("touchstart",	PointerEvent._touchStart,	true);
				}

				rEL("mousedown",	PointerEvent._mouseCatch,	true);
				rEL("mousemove",	PointerEvent._mouseCatch,	true);
				rEL("mouseover",	PointerEvent._mouseCatch,	true);
				rEL("mouseout",		PointerEvent._mouseCatch,	true);
				rEL("mouseup",		PointerEvent._mouseCatch,	true);
				rEL("click",		PointerEvent._mouseCatch,	true);
			},



			// Variables
			_pointerId:			2,
			_pointers:			{
				"1": {// Mouse
					capturePointer:		null
				}
			},
			_T2P:				{},	// Touch Identifier to pointerID
			_MSP2P:				{},	// MSPointerEvent pointerId to pointerId
			_TCurrentTouch:		0,



			// Constants
			/**
			 * @constant {String}
			 * @default ""
			 */
			POINTER_TYPE_UNAVAILABLE: {
				enumerable: true,
				value: ""
			},

			/**
			 * @constant {String}
			 * @default "touch"
			 */
			POINTER_TYPE_TOUCH: {
				enumerable: true,
				value: "touch"
			},

			/**
			 * @constant {String}
			 * @default "pen"
			 */
			POINTER_TYPE_PEN: {
				enumerable: true,
				value: "pen"
			},

			/**
			 * @constant {String}
			 * @default "mouse"
			 */
			POINTER_TYPE_MOUSE: {
				enumerable: true,
				value: "mouse"
			},



			// Event Name Constants
			/**
			 * Fires when a pointer enters an element's hitbox.
			 * 
			 * @event
			 * @type {PointerEvent}
			 * @property {Boolean} [bubbles=true]		This event bubbles.
			 * @property {Boolean} [cancelable=]	This event is not cancelable.
			 * @todo Check cancelability for this event
			 * @default "pointerover"
			 */
			POINTER_OVER: {
				enumerable: true,
				value: "pointerover"
			},

			/**
			 * Fires when a pointer enters an element's hitbox.
			 * 
			 * @event
			 * @type {PointerEvent}
			 * @property {Boolean} [bubbles=true]		This event does bubble.
			 * @property {Boolean} [cancelable=]	This event is not cancelable.
			 * @todo Check cancelability for this event
			 * @default "pointerenter"
			 */
			POINTER_ENTER: {
				enumerable: true,
				value: "pointerenter"
			},

			/**
			 * Fires when a pointer is in contact with an element.
			 * 
			 * @event
			 * @type {PointerEvent}
			 * @property {Boolean} [bubbles=true]		This event does bubble.
			 * @property {Boolean} [cancelable=]	This event is not cancelable.
			 * @todo Check cancelability for this event
			 * @default "pointerdown"
			 */
			POINTER_DOWN: {
				enumerable: true,
				value: "pointerdown"
			},

			/**
			 * Fires when a pointer moves.
			 * 
			 * @event
			 * @type {PointerEvent}
			 * @property {Boolean} [bubbles=]		This event does not bubble.
			 * @property {Boolean} [cancelable=]	This event is not cancelable.
			 * @todo Check cancelability and bubbling for this event.
			 * @default "pointermove"
			 */
			POINTER_MOVE: {
				enumerable: true,
				value: "pointermove"
			},

			/**
			 * Fires when a pointer loses contact with an element.
			 * 
			 * @event
			 * @type {PointerEvent}
			 * @property {Boolean} [bubbles=true]		This event does bubble.
			 * @property {Boolean} [cancelable=]	This event is not cancelable.
			 * @todo Check cancelability for this event
			 * @default "pointerup"
			 */
			POINTER_UP: {
				enumerable: true,
				value: "pointerup"
			},

			/**
			 * Fires when a pointer is no longer valid due to some error.
			 * 
			 * This is most common with touch based pointers and the user has too many contacts on the screen.
			 * 
			 * @event
			 * @type {PointerEvent}
			 * @property {Boolean} [bubbles=]		This event does not bubble.
			 * @property {Boolean} [cancelable=]	This event is not cancelable.
			 * @todo Check cancelability and bubbling for this event.
			 * @default "pointercancel"
			 */
			POINTER_CANCEL: {
				enumerable: true,
				value: "pointercancel"
			},

			/**
			 * Fires when a pointer leaves an element's hitbox.
			 * 
			 * @event
			 * @type {PointerEvent}
			 * @property {Boolean} [bubbles=true]		This event does bubble.
			 * @property {Boolean} [cancelable=]	This event is not cancelable.
			 * @todo Check cancelability for this event
			 * @default "pointerout"
			 */
			POINTER_OUT: {
				enumerable: true,
				value: "pointerout"
			},

			/**
			 * Fires when a pointer leaves an element's hitbox.
			 * 
			 * @event
			 * @type {PointerEvent}
			 * @property {Boolean} [bubbles=false]		This event does not bubble.
			 * @property {Boolean} [cancelable=]	This event is not cancelable.
			 * @todo Check cancelability for this event
			 * @default "pointerleave"
			 */
			POINTER_LEAVE: {
				enumerable: true,
				value: "pointerleave"
			},

			/**
			 * Fires when an element has pointer capture.
			 * 
			 * This means that this element will have all future events that the specified pointer creates fired upon it.
			 * 
			 * @event
			 * @type {PointerEvent}
			 * @property {Boolean} [bubbles=]		This event does not bubble.
			 * @property {Boolean} [cancelable=]	This event is not cancelable.
			 * @todo Check cancelability and bubbling for this event.
			 * @default "gotpointercapture"
			 */
			GOT_POINTER_CAPTURE: {
				enumerable: true,
				value: "gotpointercapture"
			},

			/**
			 * Fires when an element loses pointer capture.
			 * 
			 * @event
			 * @type {PointerEvent}
			 * @property {Boolean} [bubbles=]		This event does not bubble.
			 * @property {Boolean} [cancelable=]	This event is not cancelable.
			 * @todo Check cancelability and bubbling for this event.
			 * @default "lostpointercapture"
			 */
			LOST_POINTER_CAPTURE: {
				enumerable: true,
				value: "lostpointercapture"
			},



			// Hidden Constants
			_MS2W3C: {
				enumerable: false,
				value: {	// Microsoft Pointer Event implementation to w3c compliant event names
					MSPointerDown:			"pointerdown",
					MSPointerUp:			"pointerup",
					MSPointerCancel:		"pointercancel",
					MSPointerMove:			"pointermove",
					MSPointerOver:			"pointerover",
					MSPointerOut:			"pointerout",
					MSPointerEnter:			"pointerenter",
					MSPointerLeave:			"pointerleave",
					MSGotPointerCapture:	"gotpointercapture",
					MSLostPointerCapture:	"lostpointercapture"
				}
			},

			_ME2W3C: {
				enumerable: false,
				value: {	// MouseEvent names to w3c compliant pointer event names
					mousedown:			"pointerdown",
					mouseup:			"pointerup",
					mousemove:			"pointermove",
					mouseenter:			"pointerenter",
					mouseover:			"pointerover",
					mouseout:			"pointerout",
					mouseleave:			"pointerleave"
				}
			},

			_mouseButton2Bitmask: {
				enumerable: false,
				value: {
					0: 1,
					1: 4,
					2: 2
				}
			},



			// Hidden Methods

			_bindPointer: {
				enumerable: false,
				value: function(pointerId, element){
					if(!(pointerId in PointerEvent._pointers))
						throw new Error("Invalid Pointer Specified for pointerId");
					PointerEvent._pointers[pointerId].capturePointer = element;
					element.dispatchEvent(new CustomEvent("gotpointercapture"));
				}
			},

			_unbindPointer: {
				enumerable: false,
				value: function(pointerId, element){
					if(!(pointerId in PointerEvent._pointers))
						throw new Error("Invalid Pointer Specified for pointerId");
					PointerEvent._pointers[pointerId].capturePointer = null;
					element.dispatchEvent(new CustomEvent("lostpointercapture"));
				}
			},

			// Event Catchers

			_msPointerCatch: {
				enumerable: false,
				value: function(e){
					var _pointerEvent = e.currentTarget._pointerEvent;
					var opts = _pointerEvent.opts;

					if(opts.stopBaseEvent) e.stopImmediatePropagation();

					var eve = new PointerEvent(PointerEvent._MS2W3C[e.type], {bubbles: e.bubbles, cancelable: e.cancelable, baseEvent: e});
					e.target.dispatchEvent(eve);
					if(eve.defaultPrevented) e.preventDefault();
				}
			},

			_mouseCatch: {
				enumerable: false,
				value: function(e){
					var _pointerEvent = e.currentTarget._pointerEvent;
					var opts = _pointerEvent.opts;

					// Check to see if this event is a compatibility event
					// Done by checking when the last touch event was. This is not very accurate and can be upgraded, but it is also very fast.
					if(Date.now() - _pointerEvent.lastTouch < 400){
						// Compatibility event
						if(opts.stopCompatibilityEvents) e.stopImmediatePropagation();
						return;
					}
					if(opts.stopBaseEvent) e.stopImmediatePropagation();

					if(!("buttons" in e) && (e.type == "mousedown" || e.type == "mouseup")){
						// Track button property for buttons
						PointerEvent._pointers[1].buttons ^= PointerEvent._mouseButton2Bitmask[e.button];
					}

					var target = PointerEvent._pointers[1].capturePointer || e.target;
					var props = {
						baseEvent: e,
						bubbles: e.bubbles,
						cancelable: e.cancelable
					};
					if(target !== e.target) props.relatedTarget = null;

					var eve = new PointerEvent(PointerEvent._ME2W3C[e.type], props);
					target.dispatchEvent(eve);
					if(eve.defaultPrevented) e.preventDefault();
				}
			},

			_mouseClick: {
				enumerable: false,
				value: function(e){
					var _pointerEvent = e.currentTarget._pointerEvent;
					var opts = _pointerEvent.opts;

					if(Date.now() - _pointerEvent.lastTouch < 400 && opts.stopCompatibilityEvents) e.stopImmediatePropagation();
					if(opts.stopBaseEvent) e.stopImmediatePropagation();
				}
			},

			// Touch Listeners

			_touchStart:{
				enumerable: false,
				value: function(e){
					var len, touch, pO, pD;

					console.log("TouchStart Stuff");

					var _pointerEvent = e.currentTarget._pointerEvent;
					var opts = _pointerEvent.opts;

					if(opts.stopBaseEvent) e.stopImmediatePropagation();
					_pointerEvent.lastTouch = Date.now();

					e.target.addEventListener("touchmove",		PointerEvent._touchMove,	true);
					e.target.addEventListener("touchend",		PointerEvent._touchEnd,		true);
					e.target.addEventListener("touchcancel",	PointerEvent._touchCancel,	true);

					for(PointerEvent._TCurrentTouch = 0, len = e.changedTouches.length; PointerEvent._TCurrentTouch<len; PointerEvent._TCurrentTouch++){
						touch = e.changedTouches[PointerEvent._TCurrentTouch];
						if(touch.identifier in PointerEvent._T2P) continue; // Touch has already been processed.

						PointerEvent._T2P[touch.identifier] = PointerEvent._pointerId++;
						var pointer = PointerEvent._pointers[PointerEvent._pointerId-1] = {
							touchIdentifier:	touch.identifier,
							capturePointer:		null
						};

						pO = new PointerEvent(PointerEvent.POINTER_OVER, {
							baseEvent: e,
							touch: touch
						});
						pD = new PointerEvent(PointerEvent.POINTER_DOWN, {
							baseEvent: e,
							touch: touch
						});

						e.target.dispatchEvent(pO);
						(pointer.capturePointer || e.target).dispatchEvent(pD);

						if(pD.defaultPrevented) e.preventDefault();
						PointerEvent._pointers[PointerEvent._pointerId-1].mouseCanceled = pD.defaultPrevented;
					}
				}
			},

			_touchMove:{
				enumerable: false,
				value: function(e){
					var len, touch, pointer, pM;

					var _pointerEvent = e.currentTarget._pointerEvent;
					var opts = _pointerEvent.opts;

					if(opts.stopBaseEvent) e.stopImmediatePropagation();
					_pointerEvent.lastTouch = Date.now();

					for(PointerEvent._TCurrentTouch = 0, len = e.changedTouches.length; PointerEvent._TCurrentTouch<len; PointerEvent._TCurrentTouch++){
						touch	= e.changedTouches[PointerEvent._TCurrentTouch];
						pointer	= PointerEvent._pointers[PointerEvent._T2P[touch.identifier]];

						pM = new PointerEvent(PointerEvent.POINTER_MOVE, {
							baseEvent: e,
							touch: touch
						});
						(pointer.capturePointer || touch.target).dispatchEvent(pM);

						if(pM.defaultPrevented === true) e.preventDefault();
					}
				}
			},

			_touchEnd: {
				enumerable: false,
				value: function(e){
					var len, touch, pointer, target, pU, pO;

					var _pointerEvent = e.currentTarget._pointerEvent;
					var opts = _pointerEvent.opts;

					if(opts.stopBaseEvent) e.stopImmediatePropagation();
					_pointerEvent.lastTouch = Date.now();

					e.target.removeEventListener("touchmove",	PointerEvent._touchMove,	true);
					e.target.removeEventListener("touchend",	PointerEvent._touchEnd,		true);
					e.target.removeEventListener("touchcancel",	PointerEvent._touchCancel,	true);

					for(PointerEvent._TCurrentTouch = 0, len = e.changedTouches.length; PointerEvent._TCurrentTouch<len; PointerEvent._TCurrentTouch++){
						touch	= e.changedTouches[PointerEvent._TCurrentTouch];
						pointer	= PointerEvent._pointers[PointerEvent._T2P[touch.identifier]];
						target	= pointer.capturePointer || touch.target;

						pU = new PointerEvent(PointerEvent.POINTER_UP, {
							baseEvent: e,
							touch: touch
						});
						pO = new PointerEvent(PointerEvent.POINTER_OUT, {
							baseEvent: e,
							touch: touch
						});
						target.dispatchEvent(pU);
						target.dispatchEvent(pO);

						if(pU.defaultPrevented || pO.defaultPrevented) e.preventDefault();

						delete PointerEvent._pointers[PointerEvent._T2P[touch.identifier]];
						delete PointerEvent._T2P[touch.identifier];
					}
				}
			},

			_touchCancel: {
				enumerable: false,
				value: function(e){
					var touch, pointer, target, pU, pO, pC;

					var _pointerEvent = e.currentTarget._pointerEvent;
					var opts = _pointerEvent.opts;

					if(opts.stopBaseEvent) e.stopImmediatePropagation();
					_pointerEvent.lastTouch = Date.now();

					e.target.removeEventListener("touchmove",	PointerEvent._touchMove,	true);
					e.target.removeEventListener("touchend",	PointerEvent._touchEnd,		true);
					e.target.removeEventListener("touchcancel",	PointerEvent._touchCancel,	true);

					for(PointerEvent._TCurrentTouch = 0, len = e.changedTouches.length; PointerEvent._TCurrentTouch<len; PointerEvent._TCurrentTouch++){
						touch	= e.changedTouches[PointerEvent._TCurrentTouch];
						pointer	= PointerEvent._pointers[PointerEvent._T2P[touch.identifier]];
						target	= pointer.capturePointer || touch.target;

						pU = new PointerEvent(PointerEvent.POINTER_UP, {
							baseEvent: e,
							touch: touch
						});
						pO = new PointerEvent(PointerEvent.POINTER_OUT, {
							baseEvent: e,
							touch: touch
						});
						pC = new PointerEvent(PointerEvent.POINTER_CANCEL, {
							baseEvent: e,
							touch: touch
						});
						target.dispatchEvent(pU);
						target.dispatchEvent(pO);
						target.dispatchEvent(pC);
						delete PointerEvent._pointers[PointerEvent._T2P[touch.identifier]];
						delete PointerEvent._T2P[touch.identifier];
					}
				}
			}
		}
	);

	/** 
	 * A browser's built-in Element class
	 * 
	 * @external Element
	 * @global
	 */
	
	/**
	 * This method allows an element to receive all future events from the pointer with the specified pointerId.
	 * 
	 * @fires PointerEvent.GOT_POINTER_CAPTURE
	 * 
	 * @function external:Element#setPointerCapture
	 * @param {Number} pointerId - The pointerId of the pointer to capture all events from.
	 */
	Element.prototype.setPointerCapture = function setPointerCapture(pointerId){
		PointerEvent._bindPointer(pointerId, this);
	};

	/**
	 * This method nullifies a previous call to Element#setPointerCapture
	 * 
	 * @fires PointerEvent.LOST_POINTER_CAPTURE
	 * 
	 * @function external:Element#releasePointerCapture
	 * @param {Number} pointerId - The pointerId of the pointer to stop capturing events from.
	 */
	Element.prototype.releasePointerCapture = function releasePointerCapture(pointerId){
		PointerEvent._unbindPointer(pointerId, this);
	};
	
	
	/**
	 * This version of PointerEvent is compliant with w3c spec except where otherwise noted below
	 * http://www.w3.org/TR/2015/REC-pointerevents-20150224/
	 * 
	 * Does not support pointerenter and pointerleave for touch events
	 */
	
	if(angular)
		angular.module("bam5PointerEvent", ["bam5Util"])

		.directive("bam5PointerEvents", ["$PointerEvent", function($PointerEvent){
			return {
				restrict: "A",
				scope: {opts: "=bam5PointerEvents"},
				link: function(scope, elem, attrs){
					$PointerEvent.InterpretEvents(elem[0], scope.opts);
					var clean = function(){
						scope.$off("$destroy", clean);
						$PointerEvent.RemoveInterpretation(elem);
					};
					scope.$on("$destroy", clean);
				}
			};
		}])

		.constant("$PointerEvent", PointerEvent)

		;
	
})();
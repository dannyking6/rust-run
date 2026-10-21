// game-driver.js — neutral local stand-in for the distribution wrapper SDK.
// Loaded FIRST in <head> so it exists before any game script runs.
// Surface: window.gs.sdk(), window.gs.emitReadyEvent(), event 'sdk.ready'.
(function () {
  'use strict';
  var ls = {};
  function fire(target, type) {
    try {
      var ev = typeof CustomEvent === 'function' ? new CustomEvent(type) : null;
      if (ev && target.dispatchEvent) target.dispatchEvent(ev);
    } catch (e) {}
    var arr = ls[type] || [];
    for (var i = 0; i < arr.length; i++) { try { arr[i]({ type: type }); } catch (e) {} }
  }

  var sdkStub = {
    init: function () {},
    showBanner: function (done) { try { done && done(); } catch (e) {} },
    onStart: function () {},
    onComplete: function () {},
    onRendered: function () {},
    // benign rewarded flow: resolves immediately with a status so no gameplay wait can freeze
    rewarded: function (done) { try { done && done('dismissed'); } catch (e) {} },
    reward: function (cb) { try { cb && cb({ status: 'dismissed' }); } catch (e) {} }
  };

  var instance = {
    version: 'neutral-1.0.0',
    blocked: false,           // availability check always passes
    hasRewardedAds: true,
    adsDisabled: true,
    allowsExternalLinks: false,
    startsOnFirstInput: false,
    timeouts: {},
    caps: { rewarded: false, banner: false, login: false },
    appId: '',
    // SDK access — returns the local neutral implementation
    sdk: function () { return sdkStub; },
    locateSdk: function () { return Promise.resolve({ sdk: sdkStub }); },
    allowedHere: function () { return true; },
    init: function () { return Promise.resolve(sdkStub); },
    loadingStart: function () {},
    gameplayStart: function () {},
    gameplayStop: function () {},
    happyInterlude: function () {},
    // banner / reward shapes
    banner: function (cb) { try { cb && cb(); } catch (e) {} },
    showBanner: function (done) { try { done && done(); } catch (e) {} },
    bannerBackgroundColor: null,
    bannerTextColor: null,
    rewardedThisTransition: false,
    reward: function (cb) { try { cb && cb({ status: 'dismissed' }); } catch (e) {} },
    // event surface — symétrique de l'API d'addEventListener du bundle
    addEventListener: function (t, fn) { (ls[t] = ls[t] || []).push(fn); return this; },
    removeEventListener: function (t, fn) {
      var a = ls[t] || [], i = a.indexOf(fn);
      if (i >= 0) a.splice(i, 1);
    },
    dispatchEvent: function (e) {
      var type = e && e.type, arr = ls[type] || [];
      for (var i = 0; i < arr.length; i++) { try { arr[i](e); } catch (x) {} }
    },
    emitReadyEvent: function () {
      fire(instance, 'sdk.ready');
      fire(window, 'sdk.ready');
      fire(document, 'sdk.ready');
    }
  };

  window.gs = instance;

  // résout l'événement ready une fois le DOM prêt (écouteurs déjà enregistrés)
  function ready() { instance.emitReadyEvent(); }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ready, { once: true });
  } else {
    setTimeout(ready, 0);
  }

  // auto-recovery : un seul rechargement sur une erreur fatale, temporisé de 30 s
  var lastReload = 0;
  window.addEventListener('error', function () {
    var now = Date.now();
    if (now - lastReload < 30000) return;
    lastReload = now;
    try { location.reload(); } catch (e) {}
  });
})();

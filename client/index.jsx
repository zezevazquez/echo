/* global window, document */
import React from 'react'
import {render} from 'react-dom'

import {browserHistory, Router} from 'react-router'
import {syncHistoryWithStore} from 'react-router-redux'
import raven from 'raven-js'

import Root from '../common/containers/Root'
import routes from '../common/routes'
import configureStore from './configureStore'

const Raven = raven.noConflict()

if (window.sentryClientDSN) {
  Raven.config(window.sentryClientDSN)
}

const initialState = window.__INITIAL_STATE__ || {}
const store = configureStore(initialState)

syncHistoryWithStore(browserHistory, store)

render(
  <Root store={store}>
    <Router history={browserHistory}>
      {routes(store)}
    </Router>
  </Root>,
  document.getElementById('root')
)

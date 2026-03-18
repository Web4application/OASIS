// Source - https://stackoverflow.com/a/37477680
// Posted by cchamberlain, modified by community. See post 'Timeline' for change history
// Retrieved 2026-03-18, License - CC BY-SA 3.0

import autorefresh from 'jwt-autorefresh'

/** Events in your app that are triggered when your user becomes authorized or deauthorized. */
import { onAuthorize, onDeauthorize } from './events'

/** Your refresh token mechanism, returning a promise that resolves to the new access tokenFunction (library does not care about your method of persisting tokens) */
const refresh = () => {
  const init =  { method: 'POST'
                , headers: { 'Content-Type': `application/x-www-form-urlencoded` }
                , body: `refresh_token=${localStorage.refresh_token}&grant_type=refresh_token`
                }
  return fetch('/oauth/token', init)
    .then(res => res.json())
    .then(({ token_type, access_token, expires_in, refresh_token }) => {
      localStorage.access_token = access_token
      localStorage.refresh_token = refresh_token
      return access_token
    })
}

/** You supply a leadSeconds number or function that generates a number of seconds that the refresh should occur prior to the access token expiring */
const leadSeconds = () => {
  /** Generate random additional seconds (up to 30 in this case) to append to the lead time to ensure multiple clients dont schedule simultaneous refresh */
  const jitter = Math.floor(Math.random() * 30)

  /** Schedule autorefresh to occur 60 to 90 seconds prior to token expiration */
  return 60 + jitter
}

let start = autorefresh({ refresh, leadSeconds })
let cancel = () => {}
onAuthorize(access_token => {
  cancel()
  cancel = start(access_token)
})

onDeauthorize(() => cancel())

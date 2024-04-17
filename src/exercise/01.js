// Code splitting
// http://localhost:3000/isolated/exercise/01.js

import * as React from 'react'

// using React.lazy to create a Globe component which uses a dynamic import
// to get the Globe component from the '../globe' module.

/** Once the mouseOver or focus events are activated, the globe component will start beign
 * imported and lazy loaded. When we click on the checkbox, the globe component will be already loaded
 * and we don't need to wait for the component files to be called. When React comes around and calls this
 * function to load the code for this lazy component, it's already in that cache.
 */

/** the webpackPrefetch: true comment, inside the import function, adds the javascript files to the document's
head tag. The browser will automatically load these files into the browser cache so they are ready ahead of time.
 * <link rel="prefetch" as="script" href="/static/js/src_globe_index_js.chunk.js">
 * <link rel="prefetch" as="script" href="/static/js/vendors-node_modules_d3-geo_src_path_index_js-node_modules_d3-geo_src_projection_orthographic-ab9e2e.chunk.js">
 */
const loadGlobe = () => import(/* webpackPrefetch: true */'../globe');
const GlobeComponentLazy = React.lazy(loadGlobe);

function App() {
  const [showGlobe, setShowGlobe] = React.useState(false)

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'column',
        justifyContent: 'center',
        height: '100%',
        padding: '2rem',
      }}
    >
      <label style={{marginBottom: '1rem'}} 
        onFocus={loadGlobe} 
        onMouseOver={loadGlobe}>
        <input
          type="checkbox"
          checked={showGlobe}
          onChange={e => setShowGlobe(e.target.checked)}
        />
        {' show globe'}
      </label>      
      <div style={{width: 400, height: 400}}>
        {showGlobe ?
        <React.Suspense fallback={<div>Loading ...</div>}>
          <GlobeComponentLazy/>
        </React.Suspense> : 
        null}
      </div>
    </div>
  )
}
// 🦉 Note that if you're not on the isolated page, then you'll notice that this
// app actually already has a React.Suspense component higher up in the tree
// where this component is rendered, so you *could* just rely on that one.

export default App

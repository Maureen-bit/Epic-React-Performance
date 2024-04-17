// Fix "perf death by a thousand cuts"
// http://localhost:3000/isolated/exercise/06.js

import * as React from 'react'
import {
  useForceRerender,
  useDebouncedState,
  AppGrid,
  updateGridState,
  updateGridCellState,
} from '../utils'

const AppStateContext = React.createContext()
const AppDispatchContext = React.createContext()
const DogContext = React.createContext()

const initialGrid = Array.from({length: 100}, () =>
  Array.from({length: 100}, () => Math.random() * 100),
)

function appReducer(state, action) {
  switch (action.type) {

    case 'UPDATE_GRID_CELL': {
      return {...state, grid: updateGridCellState(state.grid, action)}
    }
    case 'UPDATE_GRID': {
      return {...state, grid: updateGridState(state.grid)}
    }
    default: {
      throw new Error(`Unhandled action type: ${action.type}`)
    }
  }
}

function AppProvider({children}) {
  const [state, dispatch] = React.useReducer(appReducer, {
    dogName: '',
    grid: initialGrid,
  })
  return (
    <AppStateContext.Provider value={state}>
      <AppDispatchContext.Provider value={dispatch}>
        {children}
      </AppDispatchContext.Provider>
    </AppStateContext.Provider>
  )
}

function DogProvider({children}) {
  const [state, dispatch] = React.useReducer(dogReducer, {
    dogName: '',
  })

  return (
    <DogContext.Provider value={[state, dispatch]}>
      {children}
    </DogContext.Provider>
  )
}

function useAppState() {
  const context = React.useContext(AppStateContext)
  if (!context) {
    throw new Error('useAppState must be used within the AppProvider')
  }
  return context
}

function useAppDispatch() {
  const context = React.useContext(AppDispatchContext)
  if (!context) {
    throw new Error('useAppDispatch must be used within the AppProvider')
  }
  return context
}

function useDogContext() {
  const context = React.useContext(DogContext)
  if (!context) {
    throw new Error('useAppState must be used within the AppProvider')
  }
  return context
}

function Grid() {
  const dispatch = useAppDispatch()
  const [rows, setRows] = useDebouncedState(50)
  const [columns, setColumns] = useDebouncedState(50)
  const updateGridData = () => dispatch({type: 'UPDATE_GRID'})
  return (
    <AppGrid
      onUpdateGrid={updateGridData}
      rows={rows}
      handleRowsChange={setRows}
      columns={columns}
      handleColumnsChange={setColumns}
      Cell={Cell}
    />
  )
}
Grid = React.memo(Grid)

function CellImpl({ row, column, cell}) {
  /** We created the Cell component (man-in-the-middle) to avoid every single one of these cells is getting
   * re-rendered, and that can be a little bit expensive. Especially if this cell component was rendering a
   * lot more of other components and things. We don't want it to re-render unless the slight of the state 
   * that they care about is the thing that actually changed.  */
  const dispatch = useAppDispatch()
  const handleClick = () => dispatch({type: 'UPDATE_GRID_CELL', row, column})
  return (
    <button
      className="cell"
      onClick={handleClick}
      style={{
        color: cell > 50 ? 'white' : 'black',
        backgroundColor: `rgba(0, 0, 0, ${cell / 100})`,
      }}
    >
      {Math.floor(cell)}
    </button>
  )
}
CellImpl = React.memo(CellImpl)


function Cell({row, column}) {

  /** The purpose of this component is to be responsible for consuming all of the app state, 
   * grabbing the part of the state that matters, and forwarding that along to the underlying 
   * implementation of this component. Then, that component can take advantage of memoization. */
  /** NOTE: this Cell component is gonna be still getting re-rendered, because that context value changed 
   * but the CellImpl component is not gonna be re-render. Therefore, we're doing a little bit less work. */
  const state = useAppState()
  const cell = state.grid[row][column]

  return <CellImpl cell={cell} row={row} column={column} />;
}
Cell = React.memo(Cell)

function dogReducer(state, action) {
  switch (action.type) {
    case 'TYPED_IN_DOG_INPUT': {
      return {...state, dogName: action.dogName}
    }
    default: {
      throw new Error(`Unhandled action type: ${action.type}`)
    }
  }
}

function DogNameInput() {
  const [state, dispatch] = useDogContext()
  const { dogName } = state;
  function changeDogName(event) {
    dispatch({type: 'TYPED_IN_DOG_INPUT', dogName: event.target.value })
  }

  return (
    <form onSubmit={e => e.preventDefault()}>
      <label htmlFor="dogName">Dog Name</label>
      <input
        value={dogName}
        onChange={changeDogName}
        id="dogName"
        placeholder="Toto"
      />
      {dogName ? (
        <div>
          <strong>{dogName}</strong>, I've a feeling we're not in Kansas anymore
        </div>
      ) : null}
    </form>
  )
}
function App() {
  const forceRerender = useForceRerender()
  return (
    <div className="grid-app">
      <button onClick={forceRerender}>force rerender</button>
      <AppProvider>
      <div>
          <Grid />
        </div>
      </AppProvider>

      {/** Verify this change on the profiler and performance tabs when typing the dog name, 
       * we're no longer render the grid and the performance has improved  */}
      <DogProvider>
        <DogNameInput />
      </DogProvider>

    </div>
  )
}

export default App

/*
eslint
  no-func-assign: 0,
*/

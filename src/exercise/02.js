// useMemo for expensive calculations
// http://localhost:3000/isolated/exercise/02.js

import * as React from 'react'
import {useCombobox} from '../use-combobox'
import {getItems} from '../workerized-filter-cities'
import {useAsync, useForceRerender} from '../utils'

function Menu({
  items,
  getMenuProps,
  getItemProps,
  highlightedIndex,
  selectedItem,
}) {
  return (
    <ul {...getMenuProps()}>
      {items.map((item, index) => (
        <ListItem
          key={item.id}
          getItemProps={getItemProps}
          item={item}
          index={index}
          selectedItem={selectedItem}
          highlightedIndex={highlightedIndex}
        >
          {item.name}
        </ListItem>
      ))}
    </ul>
  )
}

function ListItem({
  getItemProps,
  item,
  index,
  selectedItem,
  highlightedIndex,
  ...props
}) {
  const isSelected = selectedItem?.id === item.id
  const isHighlighted = highlightedIndex === index
  return (
    <li
      {...getItemProps({
        index,
        item,
        style: {
          fontWeight: isSelected ? 'bold' : 'normal',
          backgroundColor: isHighlighted ? 'lightgray' : 'inherit',
        },
        ...props,
      })}
    />
  )
}

function App() {
  const forceRerender = useForceRerender()
  const [inputValue, setInputValue] = React.useState('')

  /** Based on the review in the performance tab, I realized that the getItem function is being called 
   * on every render, this is a big issue because it's taking a lot of time to run and impacts the app's 
   * performance. This function only should be called when the filter changes. The main issue is that 
   * inside this function there is another one called matchSorter which has to process a large file with 
   * a lot of cities when the user wants to filter the list. This is a heavy process, that's why we need 
   * to review it.
   * 
   Once we implemented this optimization with the useMemo hook, we noticed that the getItem function is 
   gonna be called only when inputValue changes which is the filter in this case. In the performance tab, 
   we can see that the red point related to the getItems function disappeared. or in some cases, the task 
   is still red but it's using less time to run. Before the optimization was taking almost 400ms and now 
   it's taking only almost 60ms. 

   const allItems = React.useMemo(() => getItems(inputValue), [inputValue]);
   */


   /** Web workers: it helps us to take some JavaScript that's expensive to run and put it on a separate
    * thread, so the main thread is freed up to display things to the user more rapidly. It's absolutely 
    * something worth trying if we have some really intense calculations that the browser needs to crunch 
    * through, and we want to free the main thread to be able to do some work while you're doing that 
    * intense calculation. */
  const { data: allItems, run } = useAsync({data: [], status: 'pending'});
  React.useEffect(() => {
    run(getItems(inputValue))
  }, [inputValue, run] )

  const items = allItems.slice(0, 100)

  const {
    selectedItem,
    highlightedIndex,
    getComboboxProps,
    getInputProps,
    getItemProps,
    getLabelProps,
    getMenuProps,
    selectItem,
  } = useCombobox({
    items,
    inputValue,
    onInputValueChange: ({inputValue: newValue}) => setInputValue(newValue),
    onSelectedItemChange: ({selectedItem}) =>
      alert(
        selectedItem
          ? `You selected ${selectedItem.name}`
          : 'Selection Cleared',
      ),
    itemToString: item => (item ? item.name : ''),
  })

  return (
    <div className="city-app">
      <button onClick={forceRerender}>force rerender</button>
      <div>
        <label {...getLabelProps()}>Find a city</label>
        <div {...getComboboxProps()}>
          <input {...getInputProps({type: 'text'})} />
          <button onClick={() => selectItem(null)} aria-label="toggle menu">
            &#10005;
          </button>
        </div>
        <Menu
          items={items}
          getMenuProps={getMenuProps}
          getItemProps={getItemProps}
          highlightedIndex={highlightedIndex}
          selectedItem={selectedItem}
        />
      </div>
    </div>
  )
}

export default App

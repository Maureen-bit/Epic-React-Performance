// React.memo for reducing unnecessary re-renders
// http://localhost:3000/isolated/exercise/03.js

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
      {items.map((item, index) => {

      /** Extra credit - 2 */

      /** We move isSelected and isHighlighted calculations up higher in the tree (Menu). These calculations
       * were performing inside the ListItem component. In this way, we're only passing primitive values 
       * from the Parent(Menu) to Children(LisItem). When these primitive values(isHighlighted and isSelected)
       * changed, will trigger a DOM update. That way, we don't worry about breaking memoization or having 
       * to create a custom comparator.  In this option, the default behavior for React.memo is also going 
       * to give us an awesome behavior for the re-rendering of these list items */

        const isSelected = selectedItem?.id === item.id
        const isHighlighted = highlightedIndex === index
        
        return (
          <ListItem
          key={item.id}
          getItemProps={getItemProps}
          item={item}
          index={index}
          isSelected={isSelected}
          isHighlighted={isHighlighted}
        >
          {item.name}
        </ListItem>
      )})}
    </ul>
  )
}
// 🐨 Memoize the Menu here using React.memo
Menu = React.memo(Menu);


function ListItem({
  getItemProps,
  item,
  index,
  isSelected,
  isHighlighted,
  ...props
}) {

  return (
    <li
      {
        ...getItemProps({
        index,
        item,
        style: {
          fontWeight: isSelected ? 'bold' : 'normal',
          backgroundColor: isHighlighted ? 'lightgray' : 'inherit',
        },
        ...props})
      }
    />
  )
}
// 🐨 Memoize the ListItem here using React.memo
ListItem = React.memo(ListItem /*, arePropsEqual */ );


/** Extra credit 1 - We implement this comparision function because we only really needed to 
 * re-render the listItem that was highlighted and then unhighlight it. Therefore, it helps us to avoid 
 * re-render all the list items when the highlightedIndex change

  function arePropsEqual(oldProps, newProps) {
  /** First, we need to ensure that we are going to cover the cases where we don't need to re -render the item
   * If one of those props change, we need to trigger a re-render
   
  if (oldProps.getItemProps !== newProps.getItemProps) return false;
  if (oldProps.item !== newProps.item) return false;
  if (oldProps.index !== newProps.index) return false;
  if (oldProps.selectedItem !== newProps.selectedItem) return false;

  /** Ensure that we're gonna compare two different highlighted items
  if (oldProps.highlightedIndex !== newProps.highlightedIndex) {
    /** Now, we need to compare what was the last highlighted item with the new highlighted item 
    /** Was it previously highlighted, and now it still is previously highlighted? Then no, I don't need 
     * to re-render. Or was it not previously highlighted, and now it's still not previously highlighted? 
     * Then no, I don't need to re-render. If it was previously highlighted, and now it's not, then yes, 
     * I do need to re-render. 
  
    const wasPreviousHighlightedItem = oldProps.index === oldProps.highlightedIndex;
    const isNewHighlightedItem = newProps.index === newProps.highlightedIndex;
    /** If this is the case, I don't need to re-render 
    return (wasPreviousHighlightedItem === isNewHighlightedItem);
  }

  /** Otherwise, we'll go ahead and return true, indicating that no, I guess we do not need to re-render.
  return true;
} */

function App() {
  const forceRerender = useForceRerender()
  const [inputValue, setInputValue] = React.useState('')

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

/*
eslint
  no-func-assign: 0,
*/

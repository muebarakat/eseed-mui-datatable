import React from 'react';
import MUIDataTable from 'mui-datatables';
import Button from '@material-ui/core/Button';
import Tooltip from '@material-ui/core/Tooltip';

const options = {
  responsive: 'scroll',
  selectableRows: false
}
const colorButtonStyle = {
  width: '60px',
  fontSize: '100px !important',
  border: '2px solid #fffff !important',
}

const eseed-mui-datatable = (props) => {
  const getValue = (element, colAtt) => value(element, colAtt);

  const value = (element, colAtt) => {
    // The desired level of depth is reached
    if (colAtt.length === 0) {
      return element;
    }
    // if type of element is array then we loop
    if (Array.isArray(element)) {
      const finalResult = [];
      element.map((obj) => {
        if (obj === undefined || obj[colAtt[0]] === undefined) {
          finalResult.push('-');
        } else if (typeof element[colAtt] === typeof (true) || typeof element[colAtt] === Object) {
          finalResult.push(JSON.stringify(obj[colAtt[0]]));
        } else {
          finalResult.push(obj[colAtt[0]]);
        }
      });
      const copiedCols = JSON.parse(JSON.stringify(colAtt));

      if (copiedCols.length === 1) {
        return value([].concat.apply([], finalResult), []);
      }

      return value([].concat.apply([], finalResult), copiedCols.splice(-1, 1));
    }
    // if not array we access object
    if (!Array.isArray(element)) {
      if (element === undefined || element[colAtt[0]] === undefined) {
        return value('-', []);
      }
      const copiedCols = JSON.parse(JSON.stringify(colAtt));
      if (copiedCols.length === 1) {
        return value(element[colAtt[0]], []);
      }
      return value(element[colAtt[0]], copiedCols.splice(-1, 1));
    }
  };

  const addActionColumn = () => {
    const actionColumn = {
      name: props.customActions.name,
      field: props.customActions.field,
      options: {
        customRender: (index, value, updatedValue) => {
          let rows = [];
          props.customActions.actions.map(action => {
            let iconClass = ['zmdi zmdi-hc-lg', action.icon];
            rows.push(
              <Tooltip key={action.icon} title={action.tooltip}>
                <Button className="jr-btn jr-btn-lg" onClick={() => action.handler(value)} >
                  <i className={iconClass.join(' ')} />

                </Button>
              </Tooltip>)
          })
          return <div> {rows} </div>
        }
      }
    }
    const copiedCols = [...props.columns];
    copiedCols.map((col, colIndex) => {
      if (col.options) {
        col.options = { ...props.columns[colIndex].options };
      }
    })
    copiedCols.push(actionColumn);
    return copiedCols;
  }
  const convertCols = () => {
    let finalcols = JSON.parse(JSON.stringify(props.columns));

    if (props.customActions) {
      finalcols = addActionColumn();
    }
    finalcols.map((col, colIndex) => {
      // remove field attribute
      // only needed in mapping not in table
      if (props.columns[colIndex] !== undefined
        &&
        props.columns[colIndex].options !== undefined
        &&
        props.columns[colIndex].options.customRender !== undefined) {
        col.options = { ...props.columns[colIndex].options };
        col.options.customRender = props.columns[colIndex].options.customRender;
        if (props.columns[colIndex].options.actions !== undefined) {
          col.options.customActions.actions = [...props.columns[colIndex].options.actions]
        }
      }
      delete col.field;
    });
    return finalcols;
  };

  const convertData = () => {
    const finalData = [];
    const columnAttributes = [];
    let finalColumns = props.columns;

    if (props.customActions) {
      if (props.customActions) {
        finalColumns = addActionColumn();
      }
    }
    finalColumns.map((col) => {
      if (col.field) {
        if (col.field.includes('.')) {
          columnAttributes.push(col.field.split('.'));
        } else {
          columnAttributes.push(col.field);
        }
      }
    });
    // loop on data, for each row
    if (props.data) {
      props.data.map((element, elementIndex) => {
        const elementData = [];
        const elementAttributes = Object.keys(element);
        // loop on columns to maintan order, for each column
        columnAttributes.map((colAtt, colIndex) => {
          // if the attribute is of type array then
          // it's deep into the JSON object
          if (Array.isArray(colAtt)) {
            // if this element hasn't this column attribute
            if (element[colAtt[0]] === undefined || element[colAtt[0]] ===  null) {
              elementData.push('-');
            } else {
              // call getValue
              elementData.push(getValue(element, colAtt));
            }
          }
          // Not array
          // first level
          else if (element[colAtt] !== undefined) {
            if (typeof element[colAtt] === typeof (true) || typeof element[colAtt] === Object) {
              elementData.push(JSON.stringify(element[colAtt]));
            } else {
              elementData.push(element[colAtt]);
            }
          } else {
            elementData.push('-');
          }
        });
        finalData.push(elementData);
      });
    }
    return finalData;
  };

  // convert both columns & data
  const newData = convertData();
  const newCols = convertCols();

  return (
    <MUIDataTable
      title={props.title}
      data={newData}
      columns={newCols}
      options={options}
    />
  );
};

export default eseed-mui-datatable;
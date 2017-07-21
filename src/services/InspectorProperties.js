
export const blacklist = ['children', 'parent', 'tempDisplayObjectParent']
export const whitelist = ['transform', 'position', 'scale', 'rotation', 'pivot', 'skew', 'anchor']
export default class InspectorProperties {
  constructor (inspector) {
    // this.TransformBaseRef = typeof inspector.PIXI.TransformBase === 'function' ? inspector.PIXI.TransformBase : MismatchConstructor
    this.ObservablePointRef = typeof inspector.PIXI.ObservablePoint === 'function' ? inspector.PIXI.ObservablePoint : MismatchConstructor
    // this.Point = inspector.PIXI.Point
  }

  all () {
    if (!window.$pixi) {
      return []
    }
    const properties = []
    for (const property in window.$pixi) {
      if (property[0] === '_' || blacklist.indexOf(property) !== -1) {
        continue
      }
      properties.push(...this.serialize(window.$pixi[property], [property], 3))
    }
    properties.sort((a, b) => (a.path > b.path ? 1 : -1))
    return properties
  }
  set (path, value) {
    /* eslint-disable no-eval */
    eval('$pixi.' + path + ' = ' + JSON.stringify(value))
    /* eslint-enable */
  }

  serialize (value, path, depth) {
    depth--
    if (depth < 0) {
      return []
    }
    var type = typeof value
    if (type === 'undefined' || type === 'function') {
      return []
    } else if (type === 'string' || type === 'number' || type === 'boolean' || value === null) {
      return [{ path: path.join('.'), type, value }]
    } else if (type === 'object') {
      if (value === null) {
        return [{ path: path.join('.'), type, value }]
      }
      if (Array.isArray(value)) {
        return [{ path: path.join('.'), type: 'Array' }]
      }
      if (whitelist.indexOf(path[path.length - 1]) !== -1) {
        const properties = []
        for (const property in value) {
          if (property[0] === '_' || blacklist.indexOf(property) !== -1) {
            continue
          }
          properties.push(...this.serialize(value[property], [...path, property], depth))
        }
        if (value instanceof this.ObservablePointRef) {
          properties.push({
            path: path.join('.') + '.x', type: 'number', value: value.x
          }, {
            path: path.join('.') + '.y', type: 'number', value: value.y
          })
        }
        if (properties.length !== 0) {
          return properties
        }
      }
      // (typeof value.constructor ? (value.constructor.name || type) : type
      return [{ path: path.join('.'), type: 'Object' }]
    } else {
      return [{ path: path.join('.'), type: (typeof value.constructor ? (value.constructor.name || type) : type) }]
    }
  }
}

function MismatchConstructor () { };

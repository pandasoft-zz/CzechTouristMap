// Rules for MapLibre Native (Android, iOS). Native drops a whole layer when it does not support a
// property value, without an error on the map. See docs/native.md.

const unwrap = (value) => (Array.isArray(value) && value[0] === 'literal' ? value[1] : value);

// Branches of a "case" or "match" expression: [{ when, value }], in evaluation order.
// The last branch is the fallback (when = null). Other expressions return null.
function branches(expression) {
  if (!Array.isArray(expression)) {
    return null;
  }
  const [op, ...args] = expression;
  if (op === 'case') {
    const result = [];
    for (let i = 0; i + 1 < args.length; i += 2) {
      result.push({ when: args[i], value: unwrap(args[i + 1]) });
    }
    return [...result, { when: null, value: unwrap(args.at(-1)) }];
  }
  if (op === 'match') {
    const [input, ...rest] = args;
    const result = [];
    for (let i = 0; i + 1 < rest.length; i += 2) {
      const when = Array.isArray(rest[i]) ? ['match', input, rest[i], true, false] : ['==', input, rest[i]];
      result.push({ when, value: unwrap(rest[i + 1]) });
    }
    return [...result, { when: null, value: unwrap(rest.at(-1)) }];
  }
  return null;
}

// Native supports line-dasharray only as a constant or by zoom, not from feature data.
// A layer with a "case" or "match" dash array becomes one layer per dash pattern; the condition goes
// into the filter. The layer of the fallback pattern keeps the id, the others get "-dash1", "-dash2", ...
function splitDash(layer) {
  const list = branches(layer.paint?.['line-dasharray']);
  if (!list) {
    return [layer];
  }
  // A branch applies when its condition is true and no earlier condition is true.
  const conditions = list.map((b) => b.when).filter(Boolean);
  const not = (c) => ['!', c];
  const groups = new Map();
  list.forEach((b, i) => {
    const earlier = conditions.slice(0, b.when ? i : conditions.length).map(not);
    const condition = [...earlier, ...(b.when ? [b.when] : [])];
    const key = JSON.stringify(b.value);
    const group = groups.get(key) ?? { value: b.value, conditions: [], fallback: false };
    group.conditions.push(condition.length === 1 ? condition[0] : ['all', ...condition]);
    group.fallback ||= !b.when;
    groups.set(key, group);
  });
  if (groups.size === 1) {
    return [{ ...layer, paint: { ...layer.paint, 'line-dasharray': list[0].value } }];
  }
  const any = (list) => (list.length === 1 ? list[0] : ['any', ...list]);
  // The groups cover all features without overlap, so the fallback group is "none of the others".
  const others = [...groups.values()].filter((g) => !g.fallback).flatMap((g) => g.conditions);
  let n = 0;
  return [...groups.values()].map((g) => {
    const condition = g.fallback ? not(any(others)) : any(g.conditions);
    return {
      ...layer,
      id: g.fallback ? layer.id : `${layer.id}-dash${++n}`,
      filter: layer.filter ? ['all', layer.filter, condition] : condition,
      paint: { ...layer.paint, 'line-dasharray': g.value },
    };
  });
}

export function nativeLayers(layers) {
  return layers.flatMap(splitDash);
}

// Properties that Native supports only as a constant or by zoom. Used by "czmap check".
const NO_DATA = ['line-dasharray'];

// Problems of a style in Native that the style spec validator does not find.
export function nativeProblems(style) {
  const problems = [];
  const usesData = (value) => JSON.stringify(value).match(/\["(get|has|properties|feature-state|geometry-type|id)"/);
  for (const layer of style.layers) {
    for (const name of NO_DATA) {
      const value = layer.paint?.[name] ?? layer.layout?.[name];
      if (value !== undefined && usesData(value)) {
        problems.push(`${layer.id}: ${name} depends on feature data`);
      }
    }
  }
  return problems;
}

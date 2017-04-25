const d3 = window.d3
const size = 6

const logo = d3.select('.logo')
const width = logo.property('clientWidth') - 100
const height = logo.property('clientHeight') - 100

// Position helpers

const col = d => d % size
const row = d => d / size | 0
const x1 = d => col(d) * width / size
const y1 = d => row(d) * height / size
const x2 = d => (col(d) + 1) * width / size
const y2 = d => (row(d) + 1) * height / size

function createGrid (el) {
  const data = d3.range(size * size).map(d => {
    return { x1: x1(d), y1: y1(d), x2: x2(d), y2: y2(d) }
  })
  el.selectAll('line').data(data).enter().append('line')
    .attr('x1', d => d.x1)
    .attr('y1', d => d.y1)
    .attr('x2', d => d.x2)
    .attr('y2', d => d.y2)
}

// Transform flags

const f = 0x01  // Forward slash
const b = 0x02  // Backward slash
const t0 = 0x04 // Thickness 0
const t1 = 0x08 // Thickness 1
const t2 = 0x10 // Thickness 2
const t3 = 0x20 // Thickness 3

function transformGrid (el, state) {
  return el.selectAll('line').data(state)
    .transition()
      .duration(1000)
      .attr('stroke-width', function (d) {
        let w = 5
        switch (true) {
          case (d & t3) > 0: w *= 1.75
          case (d & t2) > 0: w *= 1.75
          case (d & t1) > 0: w *= 1.75
        }
        return w
      })
      .attrTween('transform', function (d, i) {
        const transform = this.getAttribute('transform')
        const deg = transform ? parseInt(transform.match(/rotate\((\d+)/)[1], 10) : 0
        // SVG transform rotates from 0, 0 by default
        // We need to rotate from the line center instead
        const cx = x1(i) + width / size / 2
        const cy = y1(i) + height / size / 2
        const nextDeg = d & b ? 0 : 90
        const delta = nextDeg - deg
        return function (t) {
          return `rotate(${deg + t * delta} ${cx} ${cy})`
        }
      })
}

const randChar = d3.randomUniform(33, 126)

function setDesc (el, text) {
  el.transition()
    .duration(1000)
    .tween('text', function () {
      return function (t) {
        const slicedText = text.slice(0, t * text.length | 0)
        const chars = d3.range((1 - t) * text.length).map(randChar)
        const randText = String.fromCharCode(...chars)
        window.requestAnimationFrame(function () {
          el.text(slicedText + randText)
        })
      }
    })
}

const states = [
  {
    descText: 'Data Strategy',
    transform: [
      t0 | b, t0 | b, t0 | b, t0 | b, t0 | f, t0 | f,
      t0 | b, t2 | b, t1 | b, t2 | b, t2 | f, t0 | f,
      t0 | b, t1 | b, t3 | b, t3 | f, t3 | b, t0 | f,
      t0 | f, t1 | f, t3 | f, t3 | b, t3 | f, t0 | b,
      t0 | f, t2 | f, t1 | f, t2 | f, t2 | b, t0 | b,
      t0 | f, t0 | f, t0 | f, t0 | f, t0 | b, t0 | b
    ]
  },
  {
    descText: 'Data Engineering',
    transform: [
      t0 | b, t0 | b, t0 | b, t1 | f, t1 | f, t1 | f,
      t1 | b, t1 | b, t1 | b, t2 | f, t2 | f, t2 | f,
      t2 | b, t2 | b, t2 | b, t3 | f, t3 | f, t3 | f,
      t3 | f, t3 | f, t3 | f, t2 | b, t2 | b, t2 | b,
      t2 | f, t2 | f, t2 | f, t1 | b, t1 | b, t1 | b,
      t1 | f, t1 | f, t1 | f, t0 | b, t0 | b, t0 | b
    ]
  },
  {
    descText: 'Data Science',
    transform: [
      t0 | f, t0 | f, t0 | b, t0 | b, t0 | b, t0 | b,
      t0 | f, t1 | f, t0 | f, t0 | f, t3 | f, t0 | b,
      t1 | f, t1 | f, t2 | f, t3 | f, t0 | f, t2 | b,
      t2 | b, t0 | f, t3 | f, t2 | f, t1 | f, t1 | f,
      t0 | b, t3 | f, t0 | f, t0 | f, t1 | f, t0 | f,
      t0 | b, t0 | b, t0 | b, t0 | b, t0 | f, t0 | f
    ]
  },
  {
    descText: 'Data Storytelling',
    transform: [
      t0 | f, t1 | f, t3 | f, t3 | b, t1 | b, t0 | b,
      t1 | f, t3 | f, t2 | f, t2 | b, t3 | b, t1 | b,
      t3 | f, t2 | f, t1 | f, t1 | b, t2 | b, t3 | b,
      t3 | b, t2 | b, t1 | b, t1 | f, t2 | f, t3 | f,
      t1 | b, t3 | b, t2 | b, t2 | f, t3 | f, t1 | f,
      t0 | b, t1 | b, t3 | b, t3 | f, t1 | f, t0 | f
    ]
  }
]

const svg = logo.select('svg')
const lines = svg.append('g').attr('transform', 'translate(50, 50)')
const desc = d3.select('.desc')

function animate (i = 0) {
  const { descText, transform } = states[i % states.length]
  transformGrid(lines, transform)
  setDesc(desc, descText)
  d3.timeout(_ => animate(i + 1), 3000)
}

createGrid(lines)
animate()


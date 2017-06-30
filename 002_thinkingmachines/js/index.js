const Two = window.Two
const TWEEN = window.TWEEN
const size = 6

const logo = document.querySelector('.logo')
const width = logo.clientWidth
const height = logo.clientHeight
const two = new Two({ type: Two.Types.canvas, width, height }).appendTo(logo)

// Position helpers

const col = d => d % size
const row = d => d / size | 0
const border = 25
const x1 = d => col(d) * (width - border * 2) / size + border
const y1 = d => row(d) * (height - border * 2) / size + border
const x2 = d => (col(d) + 1) * (width - border * 2) / size + border
const y2 = d => (row(d) + 1) * (height - border * 2) / size + border

function createGrid () {
  const grid = []
  for (let i = 0; i < size * size; i++) {
    let line = two.makeLine(x1(i), y1(i), x2(i), y2(i))
    line.stroke = '#ffffff'
    line.linewidth = 5
    line.cap = 'round'
    grid.push(line)
  }
  return grid
}

// Transform flags

const f = 0x01  // Forward slash
const b = 0x02  // Backward slash
const t0 = 0x04 // Thickness 0
const t1 = 0x08 // Thickness 1
const t2 = 0x10 // Thickness 2
const t3 = 0x20 // Thickness 3

function transformGrid (grid, state) {
  for (let i = 0; i < size * size; i++) {
    let line = grid[i]
    let lineState = state[i]
    let nextWidth = 5
    switch (true) {
      case (lineState & t3) > 0: nextWidth *= 1.75
      case (lineState & t2) > 0: nextWidth *= 1.75
      case (lineState & t1) > 0: nextWidth *= 1.75
    }
    const nextRotation = lineState & b ? 0 : Math.PI / 2
    new TWEEN.Tween({
      linewidth: line.linewidth,
      rotation: line.rotation
    })
      .easing(TWEEN.Easing.Exponential.InOut)
      .to({
        linewidth: nextWidth,
        rotation: nextRotation
      }, 1000)
      .onUpdate(function () {
        line.linewidth = this.linewidth
        line.rotation = this.rotation
      })
      .start()
  }
}

const randChar = _ => 33 + Math.floor(Math.random() * (126 - 33))

function setDesc (el, text) {
  new TWEEN.Tween({ t: 0 })
    .to({ t: 1 }, 1000)
    .onUpdate(function () {
      const t = this.t
      const slicedText = text.slice(0, t * text.length | 0)
      const chars = []
      for (let i = 0; i < (1 - t) * text.length; i++) {
        chars[i] = randChar()
      }
      const randText = String.fromCharCode(...chars)
      window.requestAnimationFrame(function () {
        el.textContent = (slicedText + randText)
      })
    })
    .start()
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

two.bind('update', function (t) {
  TWEEN.update()
}).play()

const grid = createGrid()
const desc = document.querySelector('.desc')

function cycleState (i = 0) {
  const { descText, transform } = states[i % states.length]
  transformGrid(grid, transform)
  setDesc(desc, descText)
  setTimeout(_ => cycleState(i + 1), 3000)
}
cycleState()

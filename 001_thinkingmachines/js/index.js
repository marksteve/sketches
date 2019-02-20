const Two = window.Two
const TWEEN = window.TWEEN

const logo = document.querySelector('.logo')
const width = logo.clientWidth
const height = logo.clientHeight
const two = new Two({ type: Two.Types.canvas, width, height }).appendTo(logo)

// Position helpers

const size = 6
const padding = 25
const col = i => i % size
const row = i => i / size | 0
const x1 = i => col(i) * (width - padding * 2) / size + padding
const y1 = i => row(i) * (height - padding * 2) / size + padding
const x2 = i => (col(i) + 1) * (width - padding * 2) / size + padding
const y2 = i => (row(i) + 1) * (height - padding * 2) / size + padding

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

function getLinewidth (lineState) {
  let width = 5
  switch (true) {
    case (lineState & t3) > 0: width *= 1.75
    case (lineState & t2) > 0: width *= 1.75
    case (lineState & t1) > 0: width *= 1.75
  }
  return width
}

function getRotation (lineState) {
  return lineState & b ? 0 : Math.PI / 2
}

function transformGrid (grid, state) {
  for (let i = 0; i < size * size; i++) {
    let line = grid[i]
    let lineState = state[i]
    const nextLinewidth = getLinewidth(lineState)
    const nextRotation = getRotation(lineState)
    new TWEEN.Tween({
      linewidth: line.linewidth,
      rotation: line.rotation
    })
      .easing(TWEEN.Easing.Exponential.InOut)
      .to({
        linewidth: nextLinewidth,
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

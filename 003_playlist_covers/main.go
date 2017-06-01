package main

import "github.com/fogleman/gg"

func main() {
	var w float64 = 1000
	var h float64 = 1000
	var drip float64 = 10
	dc := gg.NewContext(int(w), int(h))

	dc.SetRGB(0.9, 0.9, 0.9)
	dc.DrawRectangle(0, 0, w, h)
	dc.Fill()

	for i := 0; i <= int(drip); i += 1 {
		dc.Push()
		for j := 0; j <= int(drip); j += 1 {
			x := float64(i) * w / drip
			y := float64(j) * h / drip
			a := float64(i+j) / (2 * drip)
			dc.SetRGB(1, 1, 1)
			dc.DrawCircle(x, y, 100*a)
			dc.Fill()
		}
		dc.SetRGB(1, 1, 1)
		dc.RotateAbout(gg.Radians(180/float64(i)), w, h)
		dc.SetLineWidth(2)
		dc.DrawLine(0, float64(i)*w/drip, float64(i)*h/drip, 0)
		dc.Stroke()
		dc.Pop()
	}
	dc.SavePNG("panaginip.png")
}

export let piDouble = Math.PI * 2.0

export class Complex {
    constructor(real, imag) {
        this.real = real ?? 0
        this.imag = imag ?? 0
    }

    static exp(theta) {
        return new Complex(Math.cos(theta), Math.sin(theta))
    }

    static sum(a, b) {
        return new Complex(a.real + b.real, a.imag + b.imag)
    }

    static dif(a, b) {
        return new Complex(a.real - b.real, a.imag - b.imag)
    }
    
    static prod(a, b) {
        return new Complex(a.real * b.real, a.imag * b.imag)
    }

    static div(a, b) {
        return new Complex(a.real / b.real, a.imag / b.imag)
    }

    static cross(a, b) {
        return new Complex(a.real * b.real - a.imag * b.imag, a.real * b.imag + a.imag * b.real)
    }

    static scale(c, scaleFactor, viewportHalf) {
        return Complex.sum(Complex.prod(Complex.dif(c, viewportHalf), scaleFactor), viewportHalf)
    }

    magnitude() {
        return Math.sqrt(this.real * this.real + this.imag * this.imag)
    }

    phase() {
        return Math.atan2(this.imag, this.real)
    }

    add(other) {
        this.real += other.real 
        this.imag += other.imag 

        return this
    }

    divScalar(factor) {
        this.real /= factor
        this.imag /= factor 

        return this
    }

    mulScalar(factor) {
        this.real *= factor
        this.imag *= factor 

        return this
    }

    normalize() {
        let mag = this.magnitude()
        this.real /= mag 
        this.imag /= mag 

        return this
    }

    clone() {
        return new Complex(this.real, this.imag)
    }
}

export function fft(samples) {
    let n = samples.length

    if (n == 1) {
        return samples
    }

    let even = [], odd = []

    for (let i = 0; i < n; i += 2) {
        even.push(samples[i])
        odd.push(samples[i+1])
    }

    even = fft(even)
    odd = fft(odd)

    let frequencies = new Array(n)
    let nHalf = n / 2

    for (let i = 0; i < nHalf; ++i) {
        let l = even[i]
        let r = Complex.cross(Complex.exp(-piDouble * i / n), odd[i])

        frequencies[i] = Complex.sum(l, r)
        frequencies[i + nHalf] = Complex.dif(l, r)
    }

    return frequencies
}

export function ifft(frequencies, scale = true) {
    let n = frequencies.length

    if (n == 1) {
        return frequencies
    }

    let even = [], odd = []

    for (let i = 0; i < n; i += 2) {
        even.push(frequencies[i])
        odd.push(frequencies[i+1])
    }

    even = ifft(even, false)
    odd = ifft(odd, false)

    let samples = new Array(n)
    let nHalf = n / 2

    for (let i = 0; i < nHalf; ++i) {
        let l = even[i]
        let r = Complex.cross(Complex.exp(piDouble * i / n), odd[i])

        samples[i] = Complex.sum(l, r)
        samples[i + nHalf] = Complex.dif(l, r)

        if (scale) {
            samples[i].divScalar(n)
            samples[i + nHalf].divScalar(n)
        }
    }

    return samples
}

export function sample(frequencies, t) {
    let sample = new Complex()
    let n = frequencies.length

    for (let i = 0; i < n; ++i) {
        sample = Complex.sum(sample, Complex.cross(frequencies[i], Complex.exp(piDouble * i * t / n)))
    }

    return sample.divScalar(n)
}

export function sample2(frequencies, t) {
    let sample = new Complex()
    let components = []
    
    let n = frequencies.length

    for (let i = 0; i < n; ++i) {
        let c = Complex.cross(frequencies[i], Complex.exp(piDouble * i * t / n))
        sample = Complex.sum(sample, c)

        components.push(c.divScalar(n))
    }

    return {
        sample: sample.divScalar(n),
        components
    }
}

export function svg(text) {
    const parent = document.createElement('div')
    parent.innerHTML = text 

    return parent.firstChild
}

export function samplesFromPath(path, numSamples) {
    let samples = []
    let length = path.getTotalLength()

    for (let i = 0; i < numSamples; ++i) {
        let point = path.getPointAtLength(i / numSamples * length)
        samples.push(new Complex(point.x, point.y))
    }

    return samples
}
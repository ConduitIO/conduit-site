import React, { useState, Fragment } from 'react'
import { useWindowSize, useWindowScroll } from 'react-use'
import Confetti from 'react-confetti'

export default () => {
    const { width, height } = useWindowSize()
    const [celebrate, setCelebrate] = useState(false)
    const { x, y } = useWindowScroll();
    return (
        <>
            <button
                type="button"
                onClick={() => setCelebrate(!celebrate)}
                className="flex self-center mt-10 mx-auto text-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-sky-100 hover:bg-sky-60"
            >
                Grab a beverage and celebrate  🎉
            </button>
           {celebrate &&  <Confetti
                width={width - 100}
                height={height + y}
                recycle={false}
                numberOfPieces={1024}
                tweenDuration={2000}
                confettiSource={{
                    w: 10,
                    h: 10,
                    y: y + 400,
                    x: width/2
                }}
            />}
        </>
    )
}
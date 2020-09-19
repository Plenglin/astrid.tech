import React from "react"
import styles from "./style.module.scss"
import { HomepageSection } from "./util"

export function ElevatorSection() {
  return (
    <HomepageSection color="#f2f2f2">
      <div className={styles.textBlock}>
        <p>
          The first program I ever wrote readwas Hello World in Java back in 6th
          grade, when I wanted to make myself a Minecraft mod. With no one to
          teach me, I taught myself, mostly through brute-force googling. At the
          end of all that, I added a few blocks to the game and honestly not
          much else. But I didn't care, I felt like it was so cool that I could
          make the computer do such cool things by writing a few lines of code.
        </p>
        <p>
          Since then, I've explored and built even more interesting projects:
          games in C#, web servers in JavaScript, Android apps in Kotlin, robots
          in C++, neural networks in Python, computer algebra systems in
          Haskell, and so much more. It feels satisfying when I invent a complex
          digital machine that cleverly solves a challenging problem.
        </p>
        <p>
          I've carried this passion for solving problems using computers to Cal
          Poly, where I'm learning about more topics, like computer
          architecture, systems programming, and theory of computation.
          Additionally, I'm working at internships to apply my education in
          practice. At FabTime, I designed a REST API for end users to interface
          with the server, and I was also able to troubleshoot the most
          complicated bugs in the code.
        </p>
        <p>
          I am always learning that there are always new things to learn. When
          I'm not coding, you can probably catch me cooking vegetarian dishes,
          playing the Chinese Erhu, or skateboarding.
        </p>
      </div>
    </HomepageSection>
  )
}


animationNames = {
  attack: 'Armature|TRex_Attack',
  death: 'Armature|TRex_Death',
  idle: 'Armature|TRex_Idle',
  jump: 'Armature|TRex_Jump',
  run: 'Armature|TRex_Run',
  walk: 'Armature|TRex_Walk',
};



updateAnimationMixer = () => {

  const data = {}
  data.clip = "none"
  Object.entries(animationNames).forEach((name) => {

    el = document.getElementById(name[0])
    if (el.checked) {
      if (data.clip) data.clip += "*"
      data.clip += name[1]
    }
  })

  const getValue = (key) => {
    const value = document.getElementById(key).value

    if (AFRAME.components['animation-mixer'].schema[key].type === 'number' && isNaN(value)) {
      return;
    }
    data[key] = value
  }
  getValue("duration")
  getValue("clampWhenFinished")
  getValue("crossFadeDuration")
  getValue("loop")
  getValue("repetitions")
  getValue("timeScale")
  getValue("startAt")

  const target = document.getElementById("trex1")
  target.setAttribute("animation-mixer", data)
}


document.addEventListener('DOMContentLoaded', () => {

  const inputs = document.querySelectorAll("input")

  inputs.forEach((input) => {
    input.addEventListener("change", updateAnimationMixer)
  })

  const selectors = document.querySelectorAll("select")

  selectors.forEach((selector) => {
    selector.addEventListener("change", updateAnimationMixer)
  })

  updateAnimationMixer()
})



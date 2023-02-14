
const animationNames = {
  attack: 'Armature|TRex_Attack',
  death: 'Armature|TRex_Death',
  idle: 'Armature|TRex_Idle',
  jump: 'Armature|TRex_Jump',
  run: 'Armature|TRex_Run',
  walk: 'Armature|TRex_Walk',
};

updateAnimationMixer = () => {

  const data = {useRegExp: true}
  data.clip = "none"
  Object.entries(animationNames).forEach((name) => {

    const regExpEscape = (s) => {
      return s.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&');
    }

    const el = document.getElementById(name[0])
    if (el.checked) {
      if (data.clip) data.clip += "|"
      data.clip += regExpEscape(name[1])
    }
  })

  const keys = ["duration",
                "clampWhenFinished",
                "crossFadeDuration",
                "loop",
                "repetitions",
                "timeScale",
                "startAt"]
  keys.forEach((key) => {
    const value = document.getElementById(key).value

    if (AFRAME.components['animation-mixer'].schema[key].type === 'number' && isNaN(value)) {
      return;
    }
    data[key] = value
  })

  const target = document.getElementById("trex1")
  target.setAttribute("animation-mixer", data)
}

document.addEventListener('DOMContentLoaded', () => {

  const inputs = document.querySelectorAll("input, select")

  inputs.forEach((input) => {
    input.addEventListener("change", updateAnimationMixer)
  })

  updateAnimationMixer()
})

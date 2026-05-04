import React from "react";
import { useNavigate } from "react-router-dom";
const AdvancedFallingLocalSetup = [
  {
    challengeId: 201,
    id: 201,
    question: "C Programming Terminology Rush",
    difficulty: "hard",

    config: {
      words: [
        "int","float","double","char","void","short","long","signed","unsigned",
        "printf","scanf","main","return","sizeof","typedef","struct","union","enum",
        "break","continue","switch","case","default","goto","const","volatile","static","extern",
        "register","auto","inline","restrict","pointer","address","dereference","malloc","calloc","realloc","free",
        "array","string","buffer","input","output","stream","file","fopen","fclose","fread","fwrite",
        "header","include","define","macro","preprocess","compiler","linker","object","binary","source",
        "loop","while","for","do","condition","iteration","recursion","function","parameter","argument",
        "variable","constant","expression","statement","block","scope","global","local","lifetime","storage",
        "increment","decrement","operator","operand","arithmetic","logical","bitwise","shift","compare","assign"
      ],

      wrongWords: [
        "pointr","pointre","deref","funtion","paramater","arguement","console.log","def","lambda","yield", "class",
        "extends","implements","public","private","protected",         
    "try","catch","finally","throw","println","systemout","select","where","join",                
    "echo","$variable",                
    "func","package","defer"    
      ],

      duration: 120,
      speed: 1.5,
      maxLives: 3,
      useLives: true
    }
  }
];

export default AdvancedFallingLocalSetup;

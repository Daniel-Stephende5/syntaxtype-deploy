import React from "react";
import { useNavigate } from "react-router-dom";
const AdancedFallingLocalSetup = [
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
        "pointr","pointre","addresss","adress","deref","dereferense",
        "funtion","fucntion","fucntionn","paramater","arguement","retrun","returnn",
        "pritnf","scanff","sacnf","mainn","mian","includee","incldue","definee","defne",
        "strcut","structt","unionn","enumm","swtich","switchh","cas","casee","brek","breakk",
        "contine","continuee","defualt","defaultt","got","gotoo","constt","volatle","volatilee",
        "statc","staticc","extren","externn","regster","registerr","inlne","inlinee","restirct","restrict",
        "mallloc","mallocc","callloc","callocc","realoc","reallocc","fre","freee",
        "arrary","arrayy","strng","stringg","bufer","buffer","inpoot","inputt","outpt","output",
        "strem","streamm","fle","filee","fopen","clos","fclosee","frread","fread",
        "fwritee","fwrit","writee","hedar","header","includ","includde","macroo","macros",
        "preproccess","preprocesss","compilerr","compiller","linkerr","linkr","objct","objectt",
        "binnary","binaryy","soruce","sourcee","loopp","loop","whille","whilee","foor","forr",
        "doo","conditon","conditionn","iteraton","iteration","recurson","recursionn",
        "expresion","expressionn","statment","statementt","bloock","block","scpoe","scopee",
        "glboal","global","locall","local","lifetme","lifetime","storag","storagee",
        "incremnt","increment","decrment","decrement","opertor","operatorr","operandd",
        "arithmtic","arithmetic","logcal","logical","bitwse","bitwise","shifft","shift",
        "comapre","compare","assignn","assign"
      ],

      duration: 60,
      speed: 1.5,
      maxLives: 3,
      useLives: true
    }
  }
];

export default AdvancedFallingLocalSetup;

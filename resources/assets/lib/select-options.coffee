# Copyright (c) ppy Pty Ltd <contact@ppy.sh>. Licensed under the GNU Affero General Public License v3.0.
# See the LICENCE file in the repository root for full licence text.

import * as React from 'react'
import { a, i, div } from 'react-dom-factories'
import { createRef, PureComponent } from 'react'

export class SelectOptions extends PureComponent
  constructor: (props) ->
    super props
    @bn = @props.bn ? 'select-options'
    @hasBlackout = @props.blackout || @props.blackout == undefined
    @ref = createRef()

    @state =
      showingSelector: false


  componentDidMount: =>
    document.addEventListener 'click', @hideSelector


  componentDidUpdate: (_prevProps, prevState) =>
    Blackout.toggle(@state.showingSelector, 0.5) if @hasBlackout && prevState.showingSelector != @state.showingSelector


  componentWillUnmount: ->
    document.removeEventListener 'click', @hideSelector


  render: =>
    classNames = "#{@bn}"
    classNames += " #{@bn}--selecting" if @state.showingSelector

    div
      className: classNames
      ref: @ref
      div
        className: "#{@bn}__select"
        @renderItem
          children: [
            div
              className: 'u-ellipsis-overflow'
              key: 'current'
              @props.selected?.text

            div
              key: 'decoration'
              className: "#{@bn}__decoration",
              i className: "fas fa-chevron-down"
          ]
          item: @props.selected
          onClick: @toggleSelector

      div
        className: "#{@bn}__selector"
        for item in @props.options
          @renderOption item


  renderOption: (item) =>
    @renderItem
      children: [
        div
          className: 'u-ellipsis-overflow'
          key: item.id
          item.text
      ],
      item: item
      selected: @props.selected?.id == item.id
      onClick: (event) => @itemSelected(event, item)


  renderItem: ({ children, item, onClick, selected = false }) ->
    cssClasses = "#{@bn}__item"
    cssClasses += " #{@bn}__item--selected" if selected

    return @props.renderItem({ children, item, onClick, cssClasses }) if @props.renderItem?

    a
      className: cssClasses
      href: '#'
      key: item.id
      onClick: onClick
      children


  # dismiss the selector if clicking anywhere outside of it.
  hideSelector: (e) =>
    @setState showingSelector: false if e.button == 0 && !(@ref.current in e.composedPath())


  itemSelected: (event, item) ->
    return if event.button != 0
    event.preventDefault()

    @setState showingSelector: false
    @props.onItemSelected?(item)


  toggleSelector: (event) =>
    return if event.button != 0
    event.preventDefault()

    @setState showingSelector: !@state.showingSelector

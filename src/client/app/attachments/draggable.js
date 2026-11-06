import { map } from '../utils/math.utils';

/**
 * @typedef {object} DragParams
 * @property {number} x
 * @property {number} y
 * @property {number} px
 * @property {number} py
 * @property {number} distanceX
 * @property {number} distanceY
 * @property {number} distance
 * @property {boolean} isDragging
 * @property {DOMRect | undefined} rect
 * @property {Element} node
 */

/**
 * @callback DragCallback
 * @param {MouseEvent | TouchEvent} event
 * @param {DragParams} params
 * @returns {void}
 */

/**
 * @param {object} [options]
 * @param {DragCallback} [options.onDragStart]
 * @param {DragCallback} [options.onDrag]
 * @param {DragCallback} [options.onDragEnd]
 * @returns {import('svelte/attachments').Attachment<HTMLElement>}
 */
export function draggable({ onDragStart, onDrag, onDragEnd } = {}) {
	return (node) => {
		let isDragging = false;
		/** @type {number | undefined} */
		let startX;
		/** @type {number | undefined} */
		let startY;
		/** @type {DOMRect | undefined} */
		let rect;
		let classNameDragging = 'fragment-dragging';

		/**
		 *
		 * @param {MouseEvent} event
		 */
		function handleMouseDown(event) {
			onStart(event, event.clientX, event.clientY);
		}

		/**
		 *
		 * @param {MouseEvent | TouchEvent} event
		 * @param {number} x
		 * @param {number} y
		 */
		function onStart(event, x, y) {
			isDragging = true;

			startX = x;
			startY = y;

			rect = node.getBoundingClientRect();

			document.body.classList.add(classNameDragging);
			document.addEventListener('mousemove', handleMouseMove);
			document.addEventListener('mouseup', handleMouseUp);
			document.addEventListener('touchmove', handleTouchMove, {
				passive: false,
			});
			document.addEventListener('touchend', handleTouchEnd);

			const params = computeDrag(x, y);

			if (params) {
				onDragStart?.(event, params);
				onDrag?.(event, params);
			}
		}

		/**
		 * @param {MouseEvent} event
		 */
		function handleMouseMove(event) {
			const params = computeDrag(event.clientX, event.clientY);

			if (params) {
				onDrag?.(event, params);
			}
		}

		/**
		 * @param {MouseEvent} event
		 */
		function handleMouseUp(event) {
			onEnd(event, event.clientX, event.clientY);
		}

		/**
		 * @param {TouchEvent} event
		 */
		function handleTouchStart(event) {
			onStart(event, event.touches[0].clientX, event.touches[0].clientY);
		}

		/**
		 * @param {TouchEvent} event
		 */
		function handleTouchMove(event) {
			event.preventDefault();

			const params = computeDrag(
				event.touches[0].clientX,
				event.touches[0].clientY,
			);

			if (params) {
				onDrag?.(event, params);
			}
		}

		/**
		 * @param {TouchEvent} event
		 */
		function handleTouchEnd(event) {
			const touch = event.changedTouches[0];
			onEnd(event, touch.clientX, touch.clientY);
		}

		/**
		 * @param {MouseEvent | TouchEvent} event
		 * @param {number} x
		 * @param {number} y
		 */
		function onEnd(event, x, y) {
			document.body.classList.remove(classNameDragging);

			document.removeEventListener('mousemove', handleMouseMove);
			document.removeEventListener('mouseup', handleMouseUp);
			document.removeEventListener('touchmove', handleTouchMove);
			document.removeEventListener('touchend', handleTouchEnd);

			isDragging = false;

			const params = computeDrag(x, y);

			if (params) {
				onDrag?.(event, params);
				onDragEnd?.(event, params);
			}
		}

		/**
		 *
		 * @param {number} x
		 * @param {number} y
		 */
		function computeDrag(x, y) {
			if (
				rect &&
				startX !== undefined &&
				startX >= 0 &&
				startY !== undefined &&
				startY >= 0
			) {
				let distanceX = x - startX;
				let distanceY = y - startY;
				let px = map(x, rect.left, rect.right, 0, 1);
				let py = map(y, rect.top, rect.bottom, 0, 1);

				let distance = Math.sqrt(
					distanceX * distanceX + distanceY * distanceY,
				);

				return {
					x,
					y,
					px,
					py,
					distanceX,
					distanceY,
					distance,
					isDragging,
					rect,
					node,
				};
			}
		}

		node.addEventListener('mousedown', handleMouseDown);
		node.addEventListener('touchstart', handleTouchStart);

		return () => {
			node.removeEventListener('mousedown', handleMouseDown);
			node.removeEventListener('touchstart', handleTouchStart);

			rect = undefined;
			startX = undefined;
			startY = undefined;
		};
	};
}
